import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TokenDto {
  @IsString()
  @IsNotEmpty()
  tokenType: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  invitedUserId?: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsDate()
  @IsOptional()
  expiredAt?: Date;
}
