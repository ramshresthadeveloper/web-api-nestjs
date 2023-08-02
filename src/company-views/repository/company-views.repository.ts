import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

import mongoose, { Model } from 'mongoose';

import {
  CompanyViews,
  CompanyViewsDocument,
} from '@src/company-views/entities/company.views.entity';
import { BaseRepository } from '@enquiry/repository/base.repository';

@Injectable()
export class CompanyViewsRepository extends BaseRepository {
  constructor(
    @InjectModel(CompanyViews.name)
    private companyViewsModel: Model<CompanyViewsDocument>,
  ) {
    super(companyViewsModel);
  }

  async aggregate(stage) {
    return this.companyViewsModel.aggregate(stage);
  }

  async getViewsCountBetweenTwoDate(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ) {
    return await this.companyViewsModel
      .find({
        companyId: new mongoose.Types.ObjectId(companyId),
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      })
      .count();
  }

  async bulkDelete(condition) {
    return await this.companyViewsModel.deleteMany(condition);
  }
}
