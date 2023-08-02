import { BaseRepository } from '@company/repository/base.repository';
import {
  MonthlyQuestionPrompt,
  MonthlyQuestionPromptDocument,
} from '@monthly-question-prompt/entities/monthly.question.prompt.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class MonthlyQuestionPromptRepository extends BaseRepository {
  constructor(
    @InjectModel(MonthlyQuestionPrompt.name)
    private readonly monthlyQuestionPromptModel: Model<MonthlyQuestionPromptDocument>,
  ) {
    super(monthlyQuestionPromptModel);
  }

  async findMonthlyQuestionPrompt(
    monthlyQuestionPromptId: string,
  ): Promise<MonthlyQuestionPrompt | null> {
    return await this.monthlyQuestionPromptModel.findById(
      monthlyQuestionPromptId,
    );
  }

  async listMonthlyQuestionPrompt(page: number, limit: number) {
    const stages = [
      {
        $match: {
          status: 'published',
        },
      },
      {
        $sort: {
          publishedDate: -1,
        },
      },
      {
        $project: {
          _id: 1,
          question: 1,
          status: 1,
          publishedDate:1,
          totalCopiedTimes: 1,
        },
      },
    ];

    return await this.aggregatePaginate(stages, {
      page,
      limit,
    });
  }
}
