import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UnreadNotificationCountResponse {
  @Field()
  count: number;
}
