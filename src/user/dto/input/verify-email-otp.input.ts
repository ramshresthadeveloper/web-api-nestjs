import { Field, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

@InputType()
export class VerifyEmailOtpInput {
  @Field()
  @IsEmail()
  @IsNotEmpty({ message: Lang.EMAIL_REQUIRED })
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: Lang.FINGERPRINT_REQUIRED })
  fingerprint: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  firebaseToken?: string;

  @Field()
  @IsNumber()
  @IsNotEmpty({ message: Lang.OTP_REQUIRED })
  otpCode: number;
}
