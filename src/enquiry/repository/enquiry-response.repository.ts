import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import {
  EnquiryResponse,
  EnquiryResponseDocument,
} from '@src/enquiry/entities/enquiry-response.entity';
import { BaseRepository } from '@enquiry/repository/base.repository';

@Injectable()
export class EnquiryResponseRepository extends BaseRepository {
  constructor(
    @InjectModel(EnquiryResponse.name)
    private readonly enquiryResponseModel: Model<EnquiryResponseDocument>,
  ) {
    super(enquiryResponseModel);
  }

  async getInvestorResponse(companyId) {
    try {
      const result = await this.enquiryResponseModel.aggregate([
        {
          $lookup: {
            from: 'enquiries',
            localField: 'enquiryId',
            foreignField: '_id',
            as: 'enquiry',
          },
        },
        {
          $unwind: {
            path: '$enquiry',
          },
        },
        {
          $match: {
            'enquiry.companyId': new mongoose.Types.ObjectId(companyId),
            $or: [
              { 'enquiry.archivedBy': null },
              { 'enquiry.archivedBy': { $exists: false } },
            ],
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $eq: [
                          '$enquiry.companyId',
                          new mongoose.Types.ObjectId(companyId),
                        ],
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            totalSatisfied: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $eq: ['$rating', 'like'],
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            totalNotSatisfied: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $eq: ['$rating', 'dislike'],
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

      const noResultObject = {
        total: 0,
        totalSatisfied: 0,
        totalNotSatisfied: 0,
      };

      const { total, totalSatisfied, totalNotSatisfied } =
        result && result.length > 0 ? result[0] : noResultObject;
      const totalRated = totalSatisfied + totalNotSatisfied;
      return {
        satisfiedInvestorPercentage:
          totalRated > 0 ? Math.round((totalSatisfied / totalRated) * 100) : 0,
        notSatisfiedInvestorPercentage:
          totalRated > 0
            ? Math.round((totalNotSatisfied / totalRated) * 100)
            : 0,
        total: totalRated,
      };
    } catch (err) {
      throw err;
    }
  }

  async createEnquiryResponse(data) {
    return await this.enquiryResponseModel.create(data);
  }

  async findOne(condition) {
    return await this.enquiryResponseModel.findOne(condition);
  }
}
