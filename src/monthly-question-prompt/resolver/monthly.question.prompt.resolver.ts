import { MonthlyQuestionPromptService } from '@monthly-question-prompt/service/monthly.question.prompt.service';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ListMonthlyQuestionPromptResponse } from '@monthly-question-prompt/dto/response/list.monthly.question.prompt.response';
import { ListMonthlyQuesitonPromptInput } from '@monthly-question-prompt/dto/input/list.monthly.question.prompt.input';
import { GqlAuthGuard } from '@auth/guard/auth.guard';
import { CurrentUser } from '@auth/decorator/user.decorator';
import { User } from '@user/entities/user.entity';
import { CompanyIdInput } from '@executive-team/dto/input/company.input.id';
import { UnseenMonthlyQuestionCount } from '@monthly-question-prompt/dto/response/get.unseen.monthly.question.prompt.count.response';

@Resolver()
export class MonthlyQuestionPromptResolver {
  constructor(
    private readonly monthlyQuestionPromptService: MonthlyQuestionPromptService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => ListMonthlyQuestionPromptResponse)
  async getAllMonthlyQuestionPrompt(
    @CurrentUser() user: User,
    @Args('body')
    listMonthlyQuestionPromptInput: ListMonthlyQuesitonPromptInput,
  ) {
    return await this.monthlyQuestionPromptService.listMonthlyQuestionPrompt(
      listMonthlyQuestionPromptInput,
      user,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => UnseenMonthlyQuestionCount)
  async getUnseenMonthlyQuestionCount(
    @CurrentUser() user: User,
    @Args('companyId') companyId: string,
  ) {
    return await this.monthlyQuestionPromptService.getUnseenMonthlyQuestionCount(
      companyId,
      user,
    );
  }
}
