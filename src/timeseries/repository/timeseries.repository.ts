import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { Timeseries, TimeseriesDocument } from '../entities/timeseries.entity';

@Injectable()
export class TimeseriesRepository {
  constructor(
    @InjectModel(Timeseries.name)
    private timeseriesModel: Model<TimeseriesDocument>,
  ) { }

  async bulkDelete(condition) {
    return await this.timeseriesModel.deleteMany(condition);
  }
  async getDataByCompanyIdOrAsx(companyId, asxCode) {
    let timedata = await this.timeseriesModel.findOne({ companyId: companyId });
    if (!timedata) {
      timedata = await this.timeseriesModel.findOne({ asxCode: asxCode });
    }
    return timedata;
  }
  async insertMany(data) {
    return await this.timeseriesModel.insertMany(data);
  }
}
