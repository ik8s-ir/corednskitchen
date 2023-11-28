import {
  IsLowercase,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class DomainDTO {
  @IsString()
  @IsLowercase()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsLowercase()
  @IsOptional()
  @MaxLength(128)
  master?: string;

  @IsNumber()
  @IsOptional()
  last_check?: number;

  @IsString()
  @MaxLength(8)
  @IsOptional()
  type?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  notified_serial?: number;

  @IsString()
  @MaxLength(40)
  @IsOptional()
  account?: string;
}
