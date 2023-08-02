import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CompanyRepository } from '@company/repository/company.repository';
import { Company, CompanySchema } from '@company/entity/company.entity';
import {
  Notification,
  NotificationSchema,
} from './entities/notification.entity';
import { NotificationResolver } from './notification.resolver';
import { NotificationService } from './services/notification.service';
import { NotificationRepository } from './repository/notification.repository';
import { Investor, InvestorSchema } from '@investor/entities/investor.entity';
import { User, UserSchema } from '@src/user/entities/user.entity';
import { DeviceInfo, DeviceInfoSchema } from './entities/device.info.entity';
import { FcmService } from './services/fcm.service';
import { BrowserInfoModule } from '@src/browser_info/browser_info.module';
import { ConfigService } from '@nestjs/config';
import { BrowserInfoService } from '@src/browser_info/browser_info.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: Company.name, schema: CompanySchema },
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
    BrowserInfoModule,
    ConfigService,
  ],
  providers: [
    NotificationResolver,
    NotificationService,
    NotificationRepository,
    CompanyRepository,
    FcmService,
  ],
  exports: [
    NotificationModule,
    NotificationService,
    NotificationRepository,
    FcmService,
  ],
})
export class NotificationModule {}
