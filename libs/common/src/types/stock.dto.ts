import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { StockScreenerResponse } from './stock-analysis.types';

export class StockDataDto {
  @ApiProperty()
  @IsString()
  s: string;  // symbol

  @ApiProperty()
  @IsString()
  n: string;  // company name

  @ApiProperty()
  @IsNumber()
  v: number;  // volume

  @ApiProperty()
  @IsNumber()
  vw: number; // volume weighted average price

  @ApiProperty()
  @IsNumber()
  o: number;  // open

  @ApiProperty()
  @IsNumber()
  c: number;  // close

  @ApiProperty()
  @IsNumber()
  h: number;  // high

  @ApiProperty()
  @IsNumber()
  l: number;  // low

  @ApiProperty()
  @IsNumber()
  t: number;  // timestamp

  @ApiProperty()
  @IsNumber()
  mc: number; // market cap
}

export class StockScreenerDataDto {
  @ApiProperty({ type: [StockDataDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockDataDto)
  data: StockDataDto[];

  @ApiProperty()
  @IsNumber()
  resultsCount: number;

  @ApiProperty()
  @IsNumber()
  queryTime: number;
}

export class StockScreenerResponseDto implements StockScreenerResponse {
  @ApiProperty({ type: StockScreenerDataDto })
  @IsObject()
  @ValidateNested()
  @Type(() => StockScreenerDataDto)
  data: StockScreenerDataDto;

  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty()
  @IsString()
  request_id: string;
}
