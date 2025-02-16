import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString } from 'class-validator';
import { PaginationParams } from './pagination.types';

export class PaginationParamsDto implements PaginationParams {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  skip?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  orderBy?: string;

  @ApiProperty({ enum: ['ASC', 'DESC'], required: false })
  @IsString()
  @IsOptional()
  direction?: 'ASC' | 'DESC';
}
