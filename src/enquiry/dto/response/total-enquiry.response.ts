import { ObjectType, Int, Field } from '@nestjs/graphql';

@ObjectType()
export class TotalEnquiryResponse {
  @Field(() => Int)
  totalOutstanding: number;

  @Field(() => Int)
  totalAssigned: number;

  @Field(() => Int)
  totalResolved: number;

  @Field(() => Int)
  totalUnread: number;

  @Field(() => Int)
  totalArchived: number;
}
