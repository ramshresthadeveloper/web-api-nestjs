import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AnnouncementPinResponse {
  @Field()
  status: string;
}