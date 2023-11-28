import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsLowercase,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

import { RecordTypeEnum } from 'src/domain/@enums/record.enum';

export class DomainDTO {
  @IsNumber()
  @IsOptional()
  domain_id?: number;

  @IsString()
  @IsLowercase()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsNotEmpty()
  @IsEnum(RecordTypeEnum)
  type: RecordTypeEnum;

  @IsString()
  @IsOptional()
  content?: string;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  @IsInt()
  ttl?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  @IsInt()
  prio?: number;

  @IsNumber()
  @IsOptional()
  change_date?: string;

  @IsOptional()
  @IsBoolean()
  disabled?: boolean;
}
