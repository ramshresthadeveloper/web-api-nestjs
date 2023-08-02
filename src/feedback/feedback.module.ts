import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Issue, IssueSchema } from '@feedback/entities/issue.entity';
import { S3BucketModule } from '@src/s3-bucket/s3-bucket.module';
import { FeedbackService } from './feedback.service';
import { FeedbackResolver } from './feedback.resolver';
import { FeedbackRepository } from './repositories/feedback.repository';
import { ActivityModule } from '@activity/activity.module';
import { CompanyModule } from '@company/company.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Issue.name, schema: IssueSchema },
    ]),
    S3BucketModule,
    ActivityModule,
    CompanyModule,
  ],
  providers: [FeedbackService, FeedbackResolver, FeedbackRepository],
})
export class FeedbackModule {}
