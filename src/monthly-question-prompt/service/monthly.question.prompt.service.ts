import { NotificationRepository } from '@notification/repository/notification.repository';
import { User } from '@src/user/entities/user.entity';
import { ListMonthlyQuesitonPromptInput } from './../dto/input/list.monthly.question.prompt.input';
import { MonthlyQuestionPromptRepository } from '@monthly-question-prompt/repositories/monthly.question.prompt.repository';
import { Injectable } from '@nestjs/common';
import { ListMonthlyQuestionPromptResponse } from '@monthly-question-prompt/dto/response/list.monthly.question.prompt.response';
import { CompanyRepository } from '@company/repository/company.repository';
import { CompanyIdInput } from '@executive-team/dto/input/company.input.id';

@Injectable()
export class MonthlyQuestionPromptService {
  constructor(
    private readonly monthlyQuestionPromptRepository: MonthlyQuestionPromptRepository,
    private readonly companyRepository: CompanyRepository,
  ) {}

  async listMonthlyQuestionPrompt(
    listMonthlyQuestionPromptInput: ListMonthlyQuesitonPromptInput,
    user: User,
  ): Promise<ListMonthlyQuestionPromptResponse> {
    const { page, limit, companyId } = listMonthlyQuestionPromptInput;
    await this.companyRepository.resetUnseenMonthlyQuestionPromptCount(
      companyId,
      user._id,
    );

    return await this.monthlyQuestionPromptRepository.listMonthlyQuestionPrompt(
      page,
      limit,
    );
  }

  async getUnseenMonthlyQuestionCount(
    companyId: string,
    user: User,
  ) {
    const data = await this.companyRepository.getUnseenMonthlyQuestionCount(
      companyId,
      user._id,
    );
    let count = 0;
    if (data != null) {
      count = data.unseenMonthlyQuestionPromptCount[0].count;
    }
    return { count };
  }
}
