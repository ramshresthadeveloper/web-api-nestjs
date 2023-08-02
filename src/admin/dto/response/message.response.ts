import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Message {
  @Field({ nullable: true })
  message: string;
}
