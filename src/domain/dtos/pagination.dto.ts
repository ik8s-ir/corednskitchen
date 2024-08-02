import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { SortDirection } from '../../infrastructure/database/sort-direction.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDTO {
  @ApiPropertyOptional({
    description: 'Distance from the first record.',
    type: 'positive integer',
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  offset?: number;

  @ApiPropertyOptional({
    description: 'page of data.',
    type: 'positive integer',
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Fetch limitation.',
    type: 'positive integer',
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'a search text',
    type: 'string',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'field to sort by it.',
    type: 'string',
  })
  @IsString()
  @IsOptional()
  sort?: string;

  @ApiPropertyOptional({
    description: 'sort direction ENUM.',
    type: 'enum (ASC,DESC)',
    default: 'DESC',
  })
  @IsEnum(SortDirection)
  @IsOptional()
  sort_direction?: SortDirection;
}
