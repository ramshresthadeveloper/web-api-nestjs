import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Notification,
  NotificationSchema,
} from '@notification/entities/notification.entity';
import { NotificationService } from '@notification/services/notification.service';
import { NotificationRepository } from '@notification/repository/notification.repository';
import { CompanyModule } from '@src/company/company.module';
import { S3BucketService } from '@src/s3-bucket/s3-bucket.service';
import {
  EnquiryCategory,
  EnquiryCategorySchema,
} from './entities/enquiry-category.entity';
import {
  EnquiryResponse,
  EnquiryResponseSchema,
} from './entities/enquiry-response.entity';
import { Enquiry, EnquirySchema } from './entities/enquiry.entity';
import { EnquiryCategoryRepository } from './repository/enquiry-category.repository';
import { EnquiryResponseRepository } from './repository/enquiry-response.repository';
import { EnquiryRepository } from './repository/enquiry.repository';
import { EnquiryCategoryResolver } from './resolver/enquiry-category.resolver';
import { EnquiryResponseResolver } from './resolver/enquiry-response.resolver';
import { EnquiryResolver } from './resolver/enquiry.resolver';
import { EnquiryCategoryService } from './service/enquiry-category.service';
import { EnquiryResponseService } from './service/enquiry-response.service';
import { EnquiryService } from './service/enquiry.service';
import { FcmService } from '@notification/services/fcm.service';
import { User, UserSchema } from '@src/user/entities/user.entity';
import { Investor, InvestorSchema } from '@investor/entities/investor.entity';
import {
  DeviceInfo,
  DeviceInfoSchema,
} from '@notification/entities/device.info.entity';
import { Company, CompanySchema } from '@company/entity/company.entity';
import { CompanyRepository } from '@company/repository/company.repository';
import { ActivityModule } from '@activity/activity.module';
import { MailchimpService } from '@src/mailchimp/mailchimp.service';
import { CronjobService } from '@src/cronjob/cronjob.service';
import { BrowserInfoModule } from '@src/browser_info/browser_info.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Enquiry.name, schema: EnquirySchema },
      {
        name: EnquiryCategory.name,
        schema: EnquiryCategorySchema,
      },
      {
        name: EnquiryResponse.name,
        schema: EnquiryResponseSchema,
      },
      { name: Notification.name, schema: NotificationSchema },
      {
        name: User.name,
        schema: UserSchema,
      },
      { name: Investor.name, schema: InvestorSchema },
      {
        name: DeviceInfo.name,
        schema: DeviceInfoSchema,
      },
      { name: Company.name, schema: CompanySchema },
    ]),
    forwardRef(() => CompanyModule),
    ActivityModule,
    BrowserInfoModule,
  ],
  providers: [
    EnquiryRepository,
    EnquiryResolver,
    EnquiryResponseRepository,
    EnquiryService,
    EnquiryCategoryService,
    EnquiryCategoryRepository,
    EnquiryCategoryResolver,
    S3BucketService,
    EnquiryResponseResolver,
    EnquiryResponseService,
    NotificationService,
    NotificationRepository,
    FcmService,
    CompanyRepository,
    MailchimpService,
    CronjobService,
  ],
  exports: [EnquiryRepository],
})
export class EnquiryModule {}
