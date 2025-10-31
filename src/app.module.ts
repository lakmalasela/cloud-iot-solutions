import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TelemetryModule } from './telemetry/telemetry.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI || '', { autoCreate: true }),
    TelemetryModule,
    HealthModule,
  ],
})
export class AppModule {}
