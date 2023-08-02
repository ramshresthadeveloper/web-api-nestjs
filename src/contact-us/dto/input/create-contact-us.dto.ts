import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateContactUsDto {
  @Field()
  @IsString()
  @MaxLength(100)
  subject: string;

  @Field()
  @IsString()
  message: string;
}
