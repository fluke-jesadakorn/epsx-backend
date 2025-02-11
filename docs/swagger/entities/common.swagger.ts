import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'typeorm';

export class CommonEntitySwagger {
  @ApiProperty({
    description: 'Unique identifier',
    example: '507f1f77bcf86cd799439011'
  })
  _id: ObjectId;

  @ApiProperty({
    description: 'User who created the record',
    example: 'admin@example.com',
    required: false
  })
  create_by?: string;

  @ApiProperty({
    description: 'User who last edited the record',
    example: 'editor@example.com',
    required: false
  })
  edit_by?: string;

  @ApiProperty({
    description: 'User who deleted the record',
    example: 'admin@example.com',
    required: false
  })
  delete_by?: string;

  @ApiProperty({
    description: 'Version number for optimistic locking',
    example: 1,
    default: 1,
    required: false
  })
  version?: number;

  @ApiProperty({
    description: 'Timestamp when the record was created',
    example: '2024-02-09T09:00:00Z',
    required: false
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Timestamp when the record was last updated',
    example: '2024-02-09T10:00:00Z',
    required: false
  })
  updatedAt?: Date;
}
