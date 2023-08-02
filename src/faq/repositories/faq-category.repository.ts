import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FaqCategory,
  FaqCategoryDocument,
} from '../entities/faq-category.entity';
import { Model } from 'mongoose';
import Lang from '@src/constants/language';
import * as mongoose from 'mongoose';

@Injectable()
export class FaqCategoryRepository {
  constructor(
    @InjectModel(FaqCategory.name)
    private faqCategoryModel: Model<FaqCategoryDocument>,
  ) {}
  async create(createFaqCategoryData): Promise<FaqCategory> {
    return await this.faqCategoryModel.create(createFaqCategoryData);
  }

  async findMany(condition): Promise<FaqCategory[]> {
    return await this.faqCategoryModel.find(condition);
  }

  async findOne(condition): Promise<FaqCategory> {
    return await this.faqCategoryModel.findOne(condition);
  }

  async bulkDelete(condition) {
    return await this.faqCategoryModel.deleteMany(condition);
  }

  async findOneAndUpdate(condition, data): Promise<FaqCategory> {
    return await this.faqCategoryModel.findOneAndUpdate(condition, data, {
      new: true,
    });
  }

  async findOneAndDelete(condition): Promise<FaqCategory> {
    const faqCategory = await this.faqCategoryModel.findOne(condition);
    if (!faqCategory) {
      throw new NotFoundException(Lang.FAQ_CATEGORY_NOT_FOUND);
    }
    faqCategory.deleteOne();
    return faqCategory;
  }

  async getFaqCategoryWithFaqs(companyId) {
    const result = await this.faqCategoryModel.aggregate([
      {
        $match: {
          companyId: new mongoose.Types.ObjectId(companyId),
        },
      },
      {
        $lookup: {
          from: 'faqs',
          let: {
            faqCategoryId: '$_id',
          },
          pipeline: [
            {
              $sort: {
                displayOrder: 1,
              },
            },
            {
              $match: {
                $expr: {
                  $eq: ['$faqCategoryId', '$$faqCategoryId'],
                },
              },
            },
          ],
          as: 'faqs',
        },
      },
      { $sort: { displayOrder: 1 } },
      {
        $project: {
          _id: '$_id',
          faqs: '$faqs',
          categoryName: '$name',
          displayOrder: '$displayOrder',
          companyId: '$companyId',
        },
      },
    ]);
    return result;
  }

  async incrementDisplayFaqCategoryOrders(targetPosition, currentPosition) {
    try {
      return await this.faqCategoryModel.updateMany(
        {
          displayOrder: {
            $gte: targetPosition,
            $lt: currentPosition,
          },
        },
        {
          $inc: { displayOrder: 1 },
        },
      );
    } catch (err) {
      throw err;
    }
  }

  async decerementDisplayFaqCategoryOrders(targetPosition, currentPosition) {
    try {
      return await this.faqCategoryModel.updateMany(
        {
          displayOrder: {
            $lte: targetPosition,
            $gt: currentPosition,
          },
        },
        {
          $inc: { displayOrder: -1 },
        },
      );
    } catch (err) {
      throw err;
    }
  }
}
