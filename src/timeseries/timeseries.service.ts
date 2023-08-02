import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Timeseries, TimeseriesDocument } from './entities/timeseries.entity';
import { Model } from 'mongoose';
import { DateTime } from 'luxon';
import { Company, CompanyDocument } from '@src/company/entity/company.entity';
import { Cron } from '@nestjs/schedule';
import { MorningStarService } from '@src/morning-star/morning-star.service';

@Injectable()
export class TimeseriesService {
  constructor(
    @InjectModel(Timeseries.name)
    private timeseriesModel: Model<TimeseriesDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    private readonly morningStarService: MorningStarService,
  ) {}

  // // Cron for daily timeseries data at 12:10am daily
  // @Cron('10 0 * * *')
  // async createPreviousDayDailyTimeSeries() {
  //   try {
  //     const companies = await this.companyModel.find({
  //       asxCode: { $ne: "" },
  //       disabled: false,
  //     });

  //     const startTime = DateTime.now()
  //       .minus({ days: 1 })
  //       .startOf('day')
  //       .toJSDate();
  //     const endTime = DateTime.now().minus({ days: 1 }).endOf('day').toJSDate();

  //     const timeseriesIdsToDelete = [];
  //     const newTimeSeriesData = [];

  //     const chunkOfCompanies = this.splitIntoChunk(companies, 25);

  //     for (let i = 0; i < chunkOfCompanies.length; i++) {
  //       const asxCodesWithCompany: any = [];

  //       const asxCodes = chunkOfCompanies[i].map((company) => {
  //         const upperCaseAsx = company.asxCode.toUpperCase();
  //         asxCodesWithCompany[upperCaseAsx] = company._id;
  //         return company.asxCode;
  //       });

  //       await Promise.all(
  //         chunkOfCompanies[i].map(async (company) => {
  //           const oldTimeSeries = await this.timeseriesModel
  //             .findOne({
  //               companyId: company._id,
  //             })
  //             .sort({ timestamp: 1 });

  //           if (!oldTimeSeries) {
  //             return;
  //           }

  //           timeseriesIdsToDelete.push(oldTimeSeries._id);
  //         }),
  //       );

  //       const results = await this.morningStarService.getTimeSeriesData(
  //         asxCodes,
  //         startTime,
  //         endTime,
  //       );

  //       if (results.length < 1) {
  //         continue;
  //       }

  //       results.map((result) => {
  //         if (result?.data.length > 0) {
  //           result.data.map((item) => {
  //             newTimeSeriesData.push({
  //               companyId: asxCodesWithCompany[result.symbol],
  //               open: item.D17,
  //               close: item.D2,
  //               high: item.D18,
  //               low: item.D19,
  //               volume: item.D16,
  //               timestamp: item.D953,
  //             });
  //           });

  //           // await this.timeseriesModel.insertMany(newTimeSeriesData);
  //         }
  //       });
  //       function sleep(ms) {
  //         return new Promise((resolve) => setTimeout(resolve, ms));
  //       }
  //       await sleep(1000);
  //     }

  //     if (newTimeSeriesData.length > 0) {
  //       await this.timeseriesModel.deleteMany({
  //         _id: { $in: timeseriesIdsToDelete },
  //       });

  //       await this.timeseriesModel.insertMany(newTimeSeriesData);
  //     }
  //   } catch (err) {
  //     console.error('Time series cron error: ');
  //     throw err;
  //   }
  // }

  // async saveInitialAnnualTimeseriesOfCompany(companyId, companySymbol) {
  //   try {
  //     const startTime = DateTime.now()
  //       .minus({ days: 365 })
  //       .startOf('day')
  //       .toJSDate();
  //     const endTime = DateTime.now().minus({ days: 1 }).endOf('day').toJSDate();

  //     const results = await this.morningStarService.getTimeSeriesData(
  //       [companySymbol],
  //       startTime,
  //       endTime,
  //     );

  //     if (results.length < 1) {
  //       return;
  //     }
  //     const result = results[0];

  //     if (result?.data.length > 0) {
  //       const dataToInsert = result.data.map((item) => {
  //         return {
  //           companyId,
  //           open: item.D17,
  //           close: item.D2,
  //           high: item.D18,
  //           low: item.D19,
  //           volume: item.D16,
  //           timestamp: item.D953,
  //         };
  //       });

  //       this.timeseriesModel.insertMany(dataToInsert);
  //     }
  //   } catch (err) {
  //     throw err;
  //   }
  // }

  // splitIntoChunk(arr, chunk) {
  //   const newArray = [];
  //   while (arr.length > 0) {
  //     let tempArray = [];
  //     tempArray = arr.splice(0, chunk);
  //     newArray.push(tempArray);
  //   }
  //   return newArray;
  // }
}
