import { forwardRef, Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyResolver } from './company.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from './entity/company.entity';
import { CompanyRepository } from './repository/company.repository';
import { UserModule } from 'src/user/user.module';
import { MailModule } from 'src/mail/mail.module';
import { RefinitivModule } from '@src/refinitiv/refinitiv.module';
import { AnnouncementModule } from '@src/announcement/announcement.module';
import { TimeseriesModule } from '@src/timeseries/timeseries.module';
import { S3BucketService } from '@src/s3-bucket/s3-bucket.service';
import { ActivityModule } from '@activity/activity.module';
import { MorningStarModule } from '@src/morning-star/morning-star.module';
import { EnquiryModule } from '@enquiry/enquiry.module';
import { InvestorRepository } from '@investor/repository/investor.repository';
import { CompanyEventRepository } from '@src/event/repository/event.repository';
import { NotificationRepository } from '@notification/repository/notification.repository';
import { ExecutiveTeamRepository } from '@executive-team/repository/executive.team.repository';
import {
  Notification,
  NotificationSchema,
} from '@notification/entities/notification.entity';
import { Investor, InvestorSchema } from '@investor/entities/investor.entity';
import {
  ExecutiveTeam,
  ExecutiveTeamSchema,
} from '@executive-team/entities/executive.team.entity';
import {
  CompanyEvent,
  CompanyEventSchema,
} from '@src/event/entities/event.entity';
import { Activity, ActivitySchema } from '@activity/entities/activity.entity';
import { ActivityRepository } from '@activity/repository/activity.repository';
import { Faq, FaqSchema } from '@faq/entities/faq.entity';
import {
  FaqCategory,
  FaqCategorySchema,
} from '@faq/entities/faq-category.entity';
import { FaqRepository } from '@faq/repositories/faq.repository';
import { FaqCategoryRepository } from '@faq/repositories/faq-category.repository';
import {
  ResponseTemplate,
  ResponseTemplateSchema,
} from '@src/response-template/entities/response-template.entity';
import { ResponseTemplateService } from '@src/response-template/response-template.service';
import { ResponseTemplateRepository } from '@src/response-template/repository/response-template.repository';
import { MailchimpService } from '@src/mailchimp/mailchimp.service';
import { OnboardingChecklistModule } from '@src/onboarding-checklist/onboarding-checklist.module';
import { CompanyViewsModule } from '@src/company-views/company-views.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Company.name,
        schema: CompanySchema,
      },
      { name: Notification.name, schema: NotificationSchema },
      { name: Investor.name, schema: InvestorSchema },
      { name: ExecutiveTeam.name, schema: ExecutiveTeamSchema },
      { name: CompanyEvent.name, schema: CompanyEventSchema },
      { name: Activity.name, schema: ActivitySchema },
      { name: Faq.name, schema: FaqSchema },
      { name: FaqCategory.name, schema: FaqCategorySchema },
      { name: ResponseTemplate.name, schema: ResponseTemplateSchema },
    ]),
    UserModule,
    MailModule,
    RefinitivModule,
    AnnouncementModule,
    TimeseriesModule,
    MorningStarModule,
    forwardRef(() => ActivityModule),
    forwardRef(() => EnquiryModule),
    forwardRef(() => OnboardingChecklistModule),
    CompanyViewsModule
  ],
  providers: [
    CompanyService,
    CompanyResolver,
    CompanyRepository,
    S3BucketService,
    NotificationRepository,
    InvestorRepository,
    CompanyEventRepository,
    ExecutiveTeamRepository,
    ActivityRepository,
    FaqRepository,
    FaqCategoryRepository,
    ResponseTemplateService,
    ResponseTemplateRepository,
    MailchimpService,
  ],
  exports: [CompanyRepository, CompanyService],
})
export class CompanyModule {}
