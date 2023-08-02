import { MongooseModule } from '@nestjs/mongoose';
import { Module, forwardRef } from '@nestjs/common';

import { S3BucketModule } from './../s3-bucket/s3-bucket.module';
import { CompanyModule } from '@company/company.module';
import { mongooseModel } from '@executive-team/mongoose.model';
import { providers } from '@executive-team/providers';
import { ExecutiveTeamRepository } from './repository/executive.team.repository';
import { OnboardingChecklistModule } from '@src/onboarding-checklist/onboarding-checklist.module';

@Module({
  imports: [
    forwardRef(() => CompanyModule),
    MongooseModule.forFeature(mongooseModel),
    S3BucketModule,
    forwardRef(() => OnboardingChecklistModule),
  ],

  providers: providers,
  exports: [ExecutiveTeamRepository],
})
export class ExecutiveTeamModule {}
