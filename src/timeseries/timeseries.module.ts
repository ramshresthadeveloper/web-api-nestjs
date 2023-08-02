import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from '@src/company/entity/company.entity';
import { MorningStarModule } from '@src/morning-star/morning-star.module';
import { Timeseries, TimeseriesSchema } from './entities/timeseries.entity';
import { TimeseriesRepository } from './repository/timeseries.repository';
import { TimeseriesService } from './timeseries.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Timeseries.name,
        schema: TimeseriesSchema,
      },
      { name: Company.name, schema: CompanySchema },
    ]),
    MorningStarModule,
  ],
  providers: [TimeseriesService, TimeseriesRepository],
  exports: [TimeseriesService, TimeseriesRepository],
})
export class TimeseriesModule {}
