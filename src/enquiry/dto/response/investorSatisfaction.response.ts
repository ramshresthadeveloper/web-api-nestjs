import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class InvestorSatisfactionResponse {
  @Field()
  satisfiedInvestorPercentage: number;

  @Field()
  notSatisfiedInvestorPercentage: number;

  @Field()
  total: number;
}
