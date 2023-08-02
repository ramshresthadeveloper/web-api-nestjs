import { MetaForPagination } from '@announcement/dto/response/announcementlist.response';
import { Field, ID, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
class MonthlyQuestionPrompt {
  @Field(() => ID)
  _id: string;

  @Field(() => String, { nullable: true })
  question: string;

  @Field(() => String)
  status: string;

  @Field(() => String, { nullable: true })
  publishedDate?: string;

  @Field(() => Int)
  totalCopiedTimes: number;
}

@ObjectType()
export class ListMonthlyQuestionPromptResponse {
  @Field(() => [MonthlyQuestionPrompt])
  items: MonthlyQuestionPrompt[];

  @Field(() => MetaForPagination)
  meta: MetaForPagination;
}
