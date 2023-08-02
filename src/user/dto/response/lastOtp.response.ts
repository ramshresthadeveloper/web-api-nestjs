import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LastOtp {
  @Field()
  email: string;

  @Field()
  expiresAt: string;
}
