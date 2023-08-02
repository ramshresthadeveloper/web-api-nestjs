import { IsDate, IsEmail, IsNumber, IsString, Length } from 'class-validator';

export class CreateEmailOtp {
  @IsEmail()
  email: string;

  @IsNumber()
  @Length(4, 4)
  otpCode: number;

  @IsDate()
  verifiedAt: Date;

  @IsDate()
  expiredAt: Date;

  @IsNumber()
  resendCount: number;

  @IsString()
  tempToken: string;
}
