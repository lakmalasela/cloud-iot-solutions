import { Controller, Get, Inject } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import Redis from 'ioredis';

@Controller('/health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly conn: Connection,
    @Inject('REDIS') private readonly redis: Redis,
  ) {}

  @Get()
  async check() {
    const mongoOk = this.conn.readyState === 1;
    let redisOk = false;
    try {
      await this.redis.ping();
      redisOk = true;
    } catch (e) {
      redisOk = false;
    }
    return { mongo: mongoOk, redis: redisOk };
  }
}
