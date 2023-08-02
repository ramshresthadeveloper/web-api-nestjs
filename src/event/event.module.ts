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
import { InvestorModule } from '@src/investor/investor.module';
import { S3BucketModule } from '@src/s3-bucket/s3-bucket.module';
import { CompanyEvent, CompanyEventSchema } from './entities/event.entity';
import { CompanyEventResolver } from './event.resolver';
import { CompanyEventService } from './event.service';
import { CompanyEventRepository } from './repository/event.repository';
import { FcmService } from '@notification/services/fcm.service';
import { Investor, InvestorSchema } from '@investor/entities/investor.entity';
import { User, UserSchema } from '@src/user/entities/user.entity';
import {
  DeviceInfo,
  DeviceInfoSchema,
} from '@notification/entities/device.info.entity';
import { ActivityRepository } from '@activity/repository/activity.repository';
import { Activity, ActivitySchema } from '@activity/entities/activity.entity';
import { ActivityService } from '@activity/activity.service';
import { BrowserInfoModule } from '@src/browser_info/browser_info.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CompanyEvent.name, schema: CompanyEventSchema },
      { name: Company.name, schema: CompanySchema },
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
      { name: Activity.name, schema: ActivitySchema },
    ]),
    InvestorModule,
    S3BucketModule,
    BrowserInfoModule,
  ],
  providers: [
    CompanyEventService,
    CompanyEventResolver,
    CompanyEventRepository,
    CompanyRepository,
    NotificationService,
    NotificationRepository,
    FcmService,
    ActivityService,
    ActivityRepository,
  ],
  exports: [CompanyEventService, CompanyEventRepository],
})
export class EventModule {}
