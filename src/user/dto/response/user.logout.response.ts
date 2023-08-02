import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserLogoutResponse {
  @Field()
  status: string;
}
