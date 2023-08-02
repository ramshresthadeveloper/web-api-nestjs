import { Field, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class LoginUserInput {
  @Field()
  @IsEmail({}, { message: 'Please provide valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'fingerprint is required.' })
  fingerprint: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  firebaseToken?: string;

  @Field()
  @IsString()
  password: string;
}
