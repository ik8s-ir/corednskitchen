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

import { DnsRecordType } from '../../domain/@enums/dns-record-type.enum';

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
  @IsEnum(DnsRecordType)
  type: DnsRecordType;

  @IsString()
  @IsOptional()
  content?: string;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  @IsInt()
  ttl?: number;
}
