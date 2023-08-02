import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import { BaseRepository } from '@enquiry/repository/base.repository';
import { EnquiryDocument, Enquiry } from '@enquiry/entities/enquiry.entity';

import { DateTime } from 'luxon';
import {
  EnquiryResponse,
  EnquiryResponseDocument,
} from '@enquiry/entities/enquiry-response.entity';
import {
  EnquiryCategory,
  EnquiryCategoryDocument,
} from '@enquiry/entities/enquiry-category.entity';
import { TransformationType } from 'class-transformer';

@Injectable()
export class EnquiryRepository extends BaseRepository {
  constructor(
    @InjectModel(Enquiry.name)
    private readonly enquiryModel: Model<EnquiryDocument>,
    @InjectModel(EnquiryResponse.name)
    private readonly enquiryResponseModel: Model<EnquiryResponseDocument>,
    @InjectModel(EnquiryCategory.name)
    private readonly enquiryCategoryModel: Model<EnquiryCategoryDocument>,
  ) {
    super(enquiryModel);
  }

  async createEnquiry(data) {
    return await this.enquiryModel.create(data);
  }

  async assignCategoryToEnquiries(categoryId, enquiriesIds) {
    try {
      return this.enquiryModel.updateMany(
        {
          _id: { $in: enquiriesIds },
        },
        { enquiryCategoryId: categoryId },
      );
    } catch (err) {
      throw err;
    }
  }

  async getnewAndTotalOutstandingQuestionOfCompany(companyId) {
    try {
      const startOfDay = DateTime.now().startOf('day').toJSDate();
      const endOfDay = DateTime.now().endOf('day').toJSDate();

      return await this.enquiryModel.aggregate([
        {
          $match: {
            companyId: new mongoose.Types.ObjectId(companyId),
          },
        },
        {
          $group: {
            _id: null,
            newQuestions: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ['$createdAt', startOfDay] },
                      { $lte: ['$createdAt', endOfDay] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            unResolvedQuestions: {
              $sum: {
                $cond: [{ $and: [{ $ne: ['$status', 'responded'] }] }, 1, 0],
              },
            },
          },
        },
      ]);
    } catch (err) {
      throw err;
    }
  }

  async getEnquiryDetail(companyId, enquiryId) {
    try {
      const enquiryDetails = await this.enquiryModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(enquiryId),
            companyId: new mongoose.Types.ObjectId(companyId),
          },
        },
        {
          $lookup: {
            from: 'enquirycategories',
            localField: 'enquiryCategoryId',
            foreignField: '_id',
            as: 'enquiryCategory',
          },
        },
        {
          $unwind: {
            path: '$enquiryCategory',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'enquiryresponses',
            localField: '_id',
            foreignField: 'enquiryId',
            as: 'enquiryResponse',
          },
        },
        {
          $unwind: {
            path: '$enquiryResponse',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'investors',
            localField: 'investorId',
            foreignField: '_id',
            as: 'investor',
          },
        },
        {
          $unwind: {
            path: '$investor',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            companyId: 1,
            investorId: 1,
            subject: 1,
            question: 1,
            audio: 1,
            status: 1,
            assignedTo: 1,
            resolvedBy: 1,
            archivedBy: 1,
            createdAt: 1,
            enquiryCategoryId: 1,
            enquiryCategoryName: '$enquiryCategory.name',
            rating: '$enquiryResponse.rating',
            enquiryResponse: '$enquiryResponse',
            investor: '$investor',
          },
        },
      ]);
      const enquiryDetail = enquiryDetails[0] || null;

      return enquiryDetail;
    } catch (err) {
      throw err;
    }
  }

  async resolveEnquiries(enquiriesIds: string[], resolverId) {
    try {
      return await this.enquiryModel.updateMany(
        {
          _id: { $in: enquiriesIds },
        },
        { resolvedBy: resolverId, archivedBy: null },
      );
    } catch (err) {
      throw err;
    }
  }

  async archiveEnquiries(enquiriesIds: string[], userId: string) {
    try {
      return await this.enquiryModel.updateMany(
        {
          _id: { $in: enquiriesIds },
        },
        { archivedBy: userId },
      );
    } catch (err) {
      throw err;
    }
  }
  async unarchiveEnquiries(enquiriesIds: string[], userId: string) {
    try {
      return await this.enquiryModel.updateMany(
        {
          _id: { $in: enquiriesIds },
        },
        { archivedBy: null },
      );
    } catch (err) {
      throw err;
    }
  }

  async assignEnquiriesToStaff(enquiriesIds: string[], assigeeId) {
    try {
      return await this.enquiryModel.updateMany(
        {
          _id: { $in: enquiriesIds },
        },
        { assignedTo: assigeeId },
      );
    } catch (err) {
      throw err;
    }
  }

  async getEnquiriesDetails(companyId, enquiryIds) {
    try {
      const transformedEnquiryIds = enquiryIds.map(
        (id) => new mongoose.Types.ObjectId(id),
      );

      const enquiryDetails = await this.enquiryModel.aggregate([
        {
          $match: {
            _id: { $in: transformedEnquiryIds },
            companyId: new mongoose.Types.ObjectId(companyId),
          },
        },
        {
          $lookup: {
            from: 'enquirycategories',
            localField: 'enquiryCategoryId',
            foreignField: '_id',
            as: 'enquiryCategory',
          },
        },
        {
          $unwind: {
            path: '$enquiryCategory',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'enquiryresponses',
            localField: '_id',
            foreignField: 'enquiryId',
            as: 'enquiryResponse',
          },
        },
        {
          $unwind: {
            path: '$enquiryResponse',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'investors',
            let: { companyId: '$companyId', investorId: '$investorId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ['$$companyId', '$interestedCompanies'] },
                      { $eq: ['$$investorId', '$_id'] },
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  firstName: 1,
                  lastName: 1,
                  userName: 1,
                  email: 1,
                  mobileNum: 1,
                  verifiedAt: 1,
                  investorStatus: 'potential',
                },
              },
            ],
            as: 'potentialInvestor',
          },
        },
        {
          $unwind: {
            path: '$potentialInvestor',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'investors',
            let: { companyId: '$companyId', investorId: '$investorId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ['$$companyId', '$investedCompanies'] },
                      { $eq: ['$$investorId', '$_id'] },
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  firstName: 1,
                  lastName: 1,
                  userName: 1,
                  email: 1,
                  mobileNum: 1,
                  verifiedAt: 1,
                  investorStatus: 'current',
                },
              },
            ],
            as: 'currentInvestor',
          },
        },
        {
          $unwind: {
            path: '$currentInvestor',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'assignedTo',
            foreignField: '_id',
            as: 'assignee',
          },
        },
        {
          $unwind: {
            path: '$assignee',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            companyId: 1,
            investorId: 1,
            subject: 1,
            question: 1,
            audio: 1,
            status: 1,
            assignedTo: 1,
            resolvedBy: 1,
            archivedBy: 1,
            createdAt: 1,
            enquiryCategoryId: 1,
            enquiryCategoryName: '$enquiryCategory.name',
            rating: '$enquiryResponse.rating',
            enquiryResponse: '$enquiryResponse',
            investor: { $ifNull: ['$currentInvestor', '$potentialInvestor'] },
            assignee: 1,
          },
        },
      ]);

      return enquiryDetails;
    } catch (err) {
      throw err;
    }
  }

  async getUnreadEnquiryCount(companyId) {
    try {
      return await this.enquiryModel
        .find({
          $and: [
            { companyId: { $eq: new mongoose.Types.ObjectId(companyId) } },
            {
              $or: [{ assignedTo: { $exists: false } }],
            },
            {
              $or: [{ resolvedBy: { $exists: false } }],
            },
            { status: 'delivered' },
          ],
        })
        .count();
    } catch (err) {
      throw err;
    }
  }

  async findByEnquiryCategoryIdAndUpdate(enquiryCategoryId) {
    try {
      return await this.enquiryModel.updateMany(
        { enquiryCategoryId: new mongoose.Types.ObjectId(enquiryCategoryId) },
        { $set: { enquiryCategoryId: null } },
      );
    } catch (err) {
      throw err;
    }
  }

  async findByAssignedToAndUpdate(teamMemberId) {
    try {
      return await this.enquiryModel.updateMany(
        { assignedTo: new mongoose.Types.ObjectId(teamMemberId) },
        { $set: { assignedTo: null } },
      );
    } catch (err) {
      throw err;
    }
  }

  async findByIdAndUpdate(enquiryId, data) {
    try {
      return await this.enquiryModel.findByIdAndUpdate(enquiryId, data);
    } catch (err) {
      throw err;
    }
  }

  async deleteCompanyEnquiries(companyId) {
    try {
      const enquiries = await this.enquiryModel.find({
        companyId,
      });
      const enquiriesIds = enquiries.map((enquiry) => {
        return enquiry._id;
      });

      await this.enquiryModel.deleteMany({
        companyId,
      });

      await this.enquiryResponseModel.deleteMany({
        enquiryId: {
          $in: enquiriesIds,
        },
      });

      await this.enquiryCategoryModel.deleteMany({
        companyId,
      });
    } catch (err) {
      throw err;
    }
  }
  async getUnansweredEmailLists() {
    const createdAt = DateTime.now()
      .minus({ days: 3 })
      .startOf('day')
      .toJSDate();
    return await this.enquiryModel
      .find({
        $and: [
          { resolvedBy: { $exists: false } },
          { createdAt: { $lte: createdAt } },
        ],
      })
      .populate('assignedTo')
      .populate({ path: 'companyId', populate: { path: 'userId' } })
      .exec();
  }

  async getTotalEnquiry(condition) {
    return await this.enquiryModel.find(condition).count();
  }
}
