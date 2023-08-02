import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NewAndOutstandingQuestionResponse {
  @Field()
  totalOutstandingQuestions: number;

  @Field()
  totalNewQuestions: number;
}
