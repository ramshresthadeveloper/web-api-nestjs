import { Module } from '@nestjs/common';
import { MorningStarService } from './morning-star.service';
import { MorningStarResolver } from './morning-star.resolver';
import { HttpModule } from '@nestjs/axios';
import { S3BucketService } from '@s3-bucket/s3-bucket.service';
import { TimeseriesRepository } from '@src/timeseries/repository/timeseries.repository';
import { AnnouncementRepository } from '@announcement/repository/announcement.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from '@company/entity/company.entity';
import { Investor, InvestorSchema } from '@investor/entities/investor.entity';
import { Timeseries, TimeseriesSchema } from '@src/timeseries/entities/timeseries.entity';
import { Announcement, AnnouncementSchema } from '@announcement/entities/announcement.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Company.name, schema: CompanySchema },
      { name: Investor.name, schema: InvestorSchema },
      { name: Timeseries.name, schema: TimeseriesSchema },
      { name: Announcement.name, schema: AnnouncementSchema },
    ]),
    HttpModule
  ],
  providers: [MorningStarService, MorningStarResolver, S3BucketService, TimeseriesRepository, AnnouncementRepository],
  exports: [MorningStarService]
})
export class MorningStarModule { }
