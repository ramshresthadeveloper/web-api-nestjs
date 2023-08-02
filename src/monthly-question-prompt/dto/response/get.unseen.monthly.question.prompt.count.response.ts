import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UnseenMonthlyQuestionCount {
  @Field(() => Number)
  count: number;
}
