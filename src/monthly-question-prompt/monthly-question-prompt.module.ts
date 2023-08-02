import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseModel } from '@monthly-question-prompt/mongoose.model';
import { MonthlyQuestionPromptRepository } from '@monthly-question-prompt/repositories/monthly.question.prompt.repository';
import { MonthlyQuestionPromptResolver } from '@monthly-question-prompt/resolver/monthly.question.prompt.resolver';
import { MonthlyQuestionPromptService } from '@monthly-question-prompt/service/monthly.question.prompt.service';
import { NotificationModule } from '@notification/notification.module';
import { CompanyModule } from '@company/company.module';

@Module({
  imports: [MongooseModule.forFeature(mongooseModel),NotificationModule,CompanyModule],
  providers: [
    MonthlyQuestionPromptResolver,
    MonthlyQuestionPromptService,
    MonthlyQuestionPromptRepository,
  ],
  exports: [],
})
export class MonthlyQuestionPromptModule {}
