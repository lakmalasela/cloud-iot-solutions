import { IsString, IsISO8601, IsObject, ValidateNested, IsNumber, IsOptional, IsArray, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class Metrics {
  @IsNumber()
  temperature: number;

  @IsNumber()
  humidity: number;
}

export class TelemetryItemDto {
  @IsString()
  deviceId: string;

  @IsString()
  siteId: string;

  @IsISO8601()
  ts: string;

  @IsObject()
  @Type(() => Metrics)
  @ValidateNested()
  metrics: Metrics;
}

export class TelemetryPayloadDto {
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => TelemetryItemDto)
  items?: TelemetryItemDto[];

  // allow single object 
  @IsOptional()
  @Type(() => TelemetryItemDto)
  @ValidateNested()
  single?: TelemetryItemDto;
}
