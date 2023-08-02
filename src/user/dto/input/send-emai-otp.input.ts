import { Field, InputType } from '@nestjs/graphql';
import { SendEmailOtpType } from '@src/constants/dbEnum';
import Lang from '@src/constants/language';
import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class SendEmailOtpInput {
  @Field()
  @IsEmail({}, { message: 'Please provide valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'fingerprint is required.' })
  fingerprint: string;

  @Field()
  @IsIn(Object.values(SendEmailOtpType), {
    message: Lang.OTP_TYPE_MUST_BE_LOGIN_OR_REGISTER,
  })
  type: string;
}
