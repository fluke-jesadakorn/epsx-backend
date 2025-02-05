import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QueryOptions {
  @ApiProperty({
    description: 'Maximum number of results to return',
    minimum: 1,
    maximum: 100,
    default: 10,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class AiQueryDto {
  @ApiProperty({
    description: 'Natural language query to analyze financial data',
    example: 'Show me tech companies with revenue over 1 million dollars',
    required: true,
    minLength: 1,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  query: string;

  @ApiProperty({
    description: 'Query processing options',
    type: QueryOptions,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => QueryOptions)
  options?: QueryOptions;

  /**
   * Validates and returns a sanitized version of the query
   * Removes any potentially harmful characters and normalizes whitespace
   */
  sanitizeQuery(): string {
    if (!this.query) return '';
    return this.query
      .replace(/[^\w\s.,?!-]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Returns effective query options by combining defaults with provided values
   */
  getEffectiveOptions(): QueryOptions {
    const defaultOptions = new QueryOptions();
    return {
      ...defaultOptions,
      ...this.options,
    };
  }
}

/**
 * Future enhancements planned:
 * TODO: Add support for query templates
 * TODO: Add support for custom response fields
 * TODO: Add support for data export options
 * TODO: Add support for advanced analytics options
 * TODO: Add support for streaming responses
 */
