import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { Faq, FaqDocument } from '../entities/faq.entity';

@Injectable()
export class FaqRepository {
  constructor(
    @InjectModel(Faq.name)
    private faqModel: Model<FaqDocument>,
  ) {}
  async create(createFaqData): Promise<Faq> {
    return await this.faqModel.create(createFaqData);
  }

  async findMany(condition): Promise<Faq[]> {
    return await this.faqModel.find(condition);
  }

  async bulkDelete(condition) {
    // console.log('sss = ',condition);
    return await this.faqModel.deleteMany(condition);
  }

  async getFaqGroupedInCategory(companyId) {
    const result = await this.faqModel.aggregate([
      {
        $match: {
          companyId: new mongoose.Types.ObjectId(companyId),
        },
      },
      {
        $group: {
          _id: { companyId, faqCategoryId: '$faqCategoryId' },
          faqCategoryId: { $first: '$faqCategoryId' },
          faqs: {
            $push: {
              _id: '$_id',
              question: '$question',
              answer: '$answer',
              faqCategoryId: '$faqCategoryId',
              companyId: '$companyId',
            },
          },
        },
      },
      {
        $lookup: {
          from: 'faqcategories',
          localField: 'faqCategoryId',
          foreignField: '_id',
          as: 'faqCategoyDetail',
        },
      },
      {
        $unwind: {
          path: '$faqCategoyDetail',
        },
      },
      {
        $project: {
          faqCategoryId: '$faqCategoryId',
          faqs: '$faqs',
          categoryName: '$faqCategoyDetail.name',
          _id: '$faqCategoryId',
        },
      },
    ]);

    return result;
  }

  async findOneAndUpdate(condition, data): Promise<Faq> {
    return await this.faqModel.findOneAndUpdate(condition, data, {
      new: true,
    });
  }

  async findOneAndDelete(condition): Promise<Faq> {
    return await this.faqModel.findOneAndDelete(condition);
  }

  async deleteFaqsOfFaqCategory(faqCategoryId) {
    await this.faqModel.deleteMany({
      faqCategoryId,
    });
  }

  async incrementDisplayOrders(targetPosition, currentPosition) {
    try {
      return await this.faqModel.updateMany(
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

  async decrementDisplayOrders(targetPosition, currentPosition) {
    try {
      return await this.faqModel.updateMany(
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

  async getFaqCount(companyId: mongoose.Types.ObjectId) {
    return await this.faqModel
      .find({
        companyId: companyId,
      })
      .count();
  }
}
