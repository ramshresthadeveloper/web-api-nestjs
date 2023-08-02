import { ObjectType, Int, Field } from '@nestjs/graphql';

@ObjectType()
export class TotalUnReadEnquiry {
  @Field(() => Int)
  total: number;
}
