import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class GoogleLoginInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id_token: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'fingerprint is required.' })
  fingerprint: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  firebaseToken?: string;
}
