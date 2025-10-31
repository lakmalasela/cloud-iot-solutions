import { Module, Global } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { TelemetryController } from './telemetry.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Telemetry, TelemetrySchema } from './telemetry.schema';
import { ConfigModule } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Telemetry.name, schema: TelemetrySchema }]),
  ],
  controllers: [TelemetryController],
  providers: [
    TelemetryService,
    {
      provide: 'REDIS',
      useFactory: () => {
        const url = process.env.REDIS_URL || 'redis://localhost:6379';
        return new Redis(url);
      },
    },
  ],
  exports: [TelemetryService],
})
export class TelemetryModule {}
