import { Field, InputType } from '@nestjs/graphql';
import { SendEmailOtpType } from '@src/constants/dbEnum';
import Lang from '@src/constants/language';
import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class ForgetPasswordInput {
  @Field()
  @IsEmail({}, { message: 'Please provide valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;
}
