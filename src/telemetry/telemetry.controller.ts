import { Controller, Post, Body, UseGuards, Get, Param, Query, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { TelemetryItemDto } from './dto/telemetry.dto';
import { IngestGuard } from './guards/ingest.guard';

@Controller('/api/v1')
export class TelemetryController {
  constructor(private readonly svc: TelemetryService) {}

  @UseGuards(IngestGuard)
  @Post('telemetry')
  @HttpCode(HttpStatus.ACCEPTED)
  async ingest(@Body() body: any) {
    // support single or array payloads
    const items = Array.isArray(body) ? body : [body];
    if (!items.length) throw new BadRequestException('empty payload');
    const validated = [];
    for (const it of items) {
      const dto = plainToInstance(TelemetryItemDto, it);
      await validateOrReject(dto).catch(err => { throw new BadRequestException(err); });
      validated.push(dto);
    }
    // persist in sequence (could be parallel)
    const results = [];
    for (const v of validated) {
      results.push(await this.svc.persist(v));
    }
    return { accepted: results.length };
  }

  @Get('devices/:deviceId/latest')
  async latest(@Param('deviceId') deviceId: string) {
    const res = await this.svc.getLatest(deviceId);
    if (!res) return {};
    return res;
  }

  @Get('sites/:siteId/summary')
  async summary(@Param('siteId') siteId: string, @Query('from') from: string, @Query('to') to: string) {
    if (!from || !to) throw new BadRequestException('from/to required');
    return this.svc.siteSummary(siteId, from, to);
  }
}
