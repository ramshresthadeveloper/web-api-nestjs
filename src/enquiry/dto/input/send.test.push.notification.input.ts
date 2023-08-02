import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SendTestPushNotificationInput {
  @Field()
  firebaseToken: string;

  @Field()
  url: string;
}
