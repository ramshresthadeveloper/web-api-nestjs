import { ObjectType, Field } from '@nestjs/graphql';
@ObjectType()
export class OtpWithMessage {
  @Field()
  message: string;

  @Field()
  otpExpiresAt: Date;
}
