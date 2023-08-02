import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Notification,
  NotificationSchema,
} from '@notification/entities/notification.entity';
import { NotificationService } from '@notification/services/notification.service';
import { NotificationRepository } from '@notification/repository/notification.repository';
import { Company, CompanySchema } from '@src/company/entity/company.entity';
import { CompanyRepository } from '@src/company/repository/company.repository';
import {
  CompanyEvent,
  CompanyEventSchema,
} from '@src/event/entities/event.entity';
import { CompanyEventService } from '@src/event/event.service';
import { CompanyEventRepository } from '@src/event/repository/event.repository';
import { InvestorModule } from '@src/investor/investor.module';
import { S3BucketModule } from '@src/s3-bucket/s3-bucket.module';
import { AnnouncementResolver } from './announcement.resolver';
import { AnnouncementService } from './announcement.service';
import {
  Announcement,
  AnnouncementSchema,
} from './entities/announcement.entity';
import { AnnouncementRepository } from './repository/announcement.repository';
import { FcmService } from '@notification/services/fcm.service';
import { Investor, InvestorSchema } from '@investor/entities/investor.entity';
import { User, UserSchema } from '@src/user/entities/user.entity';
import {
  DeviceInfo,
  DeviceInfoSchema,
} from '@notification/entities/device.info.entity';
import { ActivityModule } from '@activity/activity.module';
import { MorningStarModule } from '@src/morning-star/morning-star.module';
import { BrowserInfoModule } from '@src/browser_info/browser_info.module';
import { CompanyViewsModule } from '@src/company-views/company-views.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Announcement.name, schema: AnnouncementSchema },
      { name: Company.name, schema: CompanySchema },
      { name: CompanyEvent.name, schema: CompanyEventSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Investor.name, schema: InvestorSchema },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: DeviceInfo.name,
        schema: DeviceInfoSchema,
      },
    ]),
    InvestorModule,
    S3BucketModule,
    ActivityModule,
    MorningStarModule,
    BrowserInfoModule,
    CompanyViewsModule,
  ],
  providers: [
    AnnouncementResolver,
    AnnouncementService,
    AnnouncementRepository,
    CompanyEventService,
    CompanyRepository,
    CompanyEventRepository,
    NotificationService,
    NotificationRepository,
    FcmService,
  ],
  exports: [AnnouncementService, AnnouncementRepository],
})
export class AnnouncementModule {}
