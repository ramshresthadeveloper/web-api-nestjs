import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EnquiryStatusResponse {
  @Field()
  status: string;
}
