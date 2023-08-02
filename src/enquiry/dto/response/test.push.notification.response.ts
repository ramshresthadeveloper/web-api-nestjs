import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TestPushNotification {
  @Field()
  status?: string;
}
