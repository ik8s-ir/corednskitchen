import { IsLowercase, IsNotEmpty, IsString } from 'class-validator';

export class DomainDTO {
  @IsString()
  @IsLowercase()
  @IsNotEmpty()
  name: string;
}
