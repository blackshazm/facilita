import { IsEnum, IsNumber, IsOptional, IsString, Max, Min, IsArray, ArrayMaxSize, IsUrl, IsBoolean } from 'class-validator';
import { ReviewRole } from '@prisma/client';

export class SubmitReviewDto {
  @IsEnum(ReviewRole)
  role: ReviewRole;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  punctualityScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  technicalScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  cleanlinessScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  overallScore?: number;

  @IsOptional()
  @IsBoolean()
  isPositive?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  @IsString({ each: true })
  @ArrayMaxSize(3)
  photoUrls?: string[];
}
