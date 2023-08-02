import { Field, InputType } from '@nestjs/graphql';
import MSG from '@src/constants/validation.message';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class AdminLoginInput {
  @Field()
  @IsEmail({}, { message: MSG.PROVIDE_VALID_EMAIL })
  @IsNotEmpty({ message: MSG.EMAIL_REQUIRED })
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: MSG.PASSWORD_REQUIRED })
  password: string;
}
