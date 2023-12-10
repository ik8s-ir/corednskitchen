import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class PaginationDTO {
  @IsInt()
  @IsPositive()
  @IsOptional()
  offset?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  page?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  limit?: number;
}
