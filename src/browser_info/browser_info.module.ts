import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { BrowserInfoService } from './browser_info.service';
import { BrowserInfoRepository } from './repository/browser.info.repository';
import { mongooseModel } from './mongoose.model';

@Module({
  imports: [MongooseModule.forFeature(mongooseModel)],
  providers: [BrowserInfoService, BrowserInfoRepository],
  exports: [BrowserInfoService],
})
export class BrowserInfoModule {}
