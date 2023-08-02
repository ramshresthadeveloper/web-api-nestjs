import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class LogoutUserInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'fingerprint is required.' })
  fingerprint: string;
}
