import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TotalInterestedAndInvestedInvestorResponse {
  @Field()
  totalInterestedInvestor: number;

  @Field()
  totalInvestedInvestor: number;
}
