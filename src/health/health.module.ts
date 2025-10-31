import { Module, Global } from '@nestjs/common';
import { HealthController } from './health.controller';
import Redis from 'ioredis';

@Global()
@Module({
  controllers: [HealthController],
  providers: [
    {
      provide: 'REDIS',
      useFactory: () => {
        const url = process.env.REDIS_URL || 'redis://localhost:6379';
        return new Redis(url);
      },
    },
  ],
  exports: [],
})
export class HealthModule {}
