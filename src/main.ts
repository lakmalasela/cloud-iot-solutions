import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';
import * as process from 'process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['error','warn','log'] });
  app.use(json({ limit: '100kb' })); // payload size limit
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Listening on ${port}`);
}
bootstrap();
