import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseModel } from './mongoose.model';
import { CompanyModule } from '@company/company.module';
import { ExecutiveTeamModule } from '@executive-team/executive-team.module';
import { FaqModule } from '@faq/faq.module';
import { OnboardingChecklistService } from './service/onboarding-checklist.service';
import { OnboardingChecklistRepository } from './repository/onboarding-checking.repository';
import { OnboardingChecklistResolver } from './onboarding-checklist.resolver';

@Module({
  imports: [
    MongooseModule.forFeature(mongooseModel),
    forwardRef(() => FaqModule),
    forwardRef(() => CompanyModule),
    forwardRef(() => ExecutiveTeamModule),
  ],
  providers: [
    OnboardingChecklistResolver,
    OnboardingChecklistService,
    OnboardingChecklistRepository,
  ],
  exports: [OnboardingChecklistService],
})
export class OnboardingChecklistModule {}
