import {
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

import { EnumDnsRecordType } from '../../infrastructure/database/@enums';

export class DNSRecordDTO {
  @IsNumber()
  @IsOptional()
  domainId?: number;

  @IsString()
  @IsLowercase()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsNotEmpty()
  @IsEnum(EnumDnsRecordType)
  type: EnumDnsRecordType;

  @IsString()
  @IsOptional()
  content?: string;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  @IsInt()
  ttl?: number;
}
