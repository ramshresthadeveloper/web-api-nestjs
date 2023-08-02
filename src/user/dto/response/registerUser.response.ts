import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RegisterUserResponse {
  @Field()
  otpExpiresAt: Date;
}
