import { Injectable, Inject, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { Telemetry, TelemetryDocument } from './telemetry.schema';
import { InjectModel } from '@nestjs/mongoose';
import Redis from 'ioredis';
import axios from 'axios';

@Injectable()
export class TelemetryService {
  private logger = new Logger(TelemetryService.name);
  private alertWebhook = process.env.ALERT_WEBHOOK_URL || '';
  constructor(
    @InjectModel(Telemetry.name) private telemetryModel: Model<TelemetryDocument>,
    @Inject('REDIS') private readonly redis: Redis,
  ) {}

  async persist(item: any) {
    const doc = await this.telemetryModel.create({
      deviceId: item.deviceId,
      siteId: item.siteId,
      ts: new Date(item.ts),
      metrics: item.metrics,
    });
    // cache latest
    const key = `latest:${item.deviceId}`;
    await this.redis.set(key, JSON.stringify(item));
    // check alerts
    await this.checkAlert(item);
    return doc;
  }

  async checkAlert(item: any) {
    try {
      const { temperature, humidity } = item.metrics || {};
      if (temperature > 50) {
        await this.raiseAlert(item, 'HIGH_TEMPERATURE', temperature);
      }
      if (humidity > 90) {
        await this.raiseAlert(item, 'HIGH_HUMIDITY', humidity);
      }
    } catch (err) {
      this.logger.error('checkAlert error', err as any);
    }
  }

  async raiseAlert(item: any, reason: string, value: number) {
    if (!this.alertWebhook) return;
    const dedupKey = `alertdedup:${item.deviceId}:${reason}`;
    const already = await this.redis.get(dedupKey);
    if (already) {
      this.logger.log(`Alert dedup suppressed for ${dedupKey}`);
      return;
    }
    const payload = {
      deviceId: item.deviceId,
      siteId: item.siteId,
      ts: item.ts,
      reason,
      value,
    };
    try {
      await axios.post(this.alertWebhook, payload, { timeout: 5000 });
      // set dedup TTL 60s
      await this.redis.set(dedupKey, '1', 'EX', 60);
      this.logger.log(`Alert sent for ${item.deviceId} ${reason}`);
    } catch (err) {
      this.logger.error('Alert send failed', (err as any).message || err);
    }
  }

  async getLatest(deviceId: string) {
    const key = `latest:${deviceId}`;
    const fromCache = await this.redis.get(key);
    if (fromCache) {
      return JSON.parse(fromCache);
    }
    // fallback to Mongo
    const doc = await this.telemetryModel.findOne({ deviceId }).sort({ ts: -1 }).lean().exec();
    if (doc) {
      const item = { deviceId: doc.deviceId, siteId: doc.siteId, ts: doc.ts.toISOString(), metrics: doc.metrics };
      await this.redis.set(key, JSON.stringify(item));
      return item;
    }
    return null;
  }

  async siteSummary(siteId: string, fromIso: string, toIso: string) {
    const from = new Date(fromIso);
    const to = new Date(toIso);
    const pipeline = [
      { $match: { siteId, ts: { $gte: from, $lt: to } } },
      { $group: {
          _id: '$siteId',
          count: { $sum: 1 },
          avgTemperature: { $avg: '$metrics.temperature' },
          maxTemperature: { $max: '$metrics.temperature' },
          avgHumidity: { $avg: '$metrics.humidity' },
          maxHumidity: { $max: '$metrics.humidity' },
          uniqueDevices: { $addToSet: '$deviceId' }
      }},
      { $project: {
          _id:0,
          count:1,
          avgTemperature:1,
          maxTemperature:1,
          avgHumidity:1,
          maxHumidity:1,
          uniqueDevices: { $size: '$uniqueDevices' }
      }}
    ];
    const res = await this.telemetryModel.aggregate(pipeline).exec();
    return res[0] || { count:0, avgTemperature:0, maxTemperature:0, avgHumidity:0, maxHumidity:0, uniqueDevices:0 };
  }
}
