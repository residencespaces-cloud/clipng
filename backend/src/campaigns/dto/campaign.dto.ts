import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { SourceType } from '@prisma/client';

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(SourceType)
  sourceType!: SourceType;

  @IsOptional()
  @IsString()
  assetUrl?: string;

  @IsOptional()
  @IsString()
  bestMoments?: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsArray()
  @IsString({ each: true })
  platforms!: string[];

  @IsNumber()
  @Min(1)
  cpm!: number;

  @IsNumber()
  @Min(1000)
  budget!: number;

  @IsOptional()
  @IsDateString()
  start?: string;

  @IsOptional()
  @IsDateString()
  end?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
