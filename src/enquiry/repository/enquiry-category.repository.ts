import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import { BaseRepository } from '@enquiry/repository/base.repository';
import {
  EnquiryCategory,
  EnquiryCategoryDocument,
} from '@src/enquiry/entities/enquiry-category.entity';

@Injectable()
export class EnquiryCategoryRepository extends BaseRepository {
  constructor(
    @InjectModel(EnquiryCategory.name)
    private readonly enquiryCategoryModel: Model<EnquiryCategoryDocument>,
  ) {
    super(enquiryCategoryModel);
  }

  async create(payload): Promise<EnquiryCategory> {
    return await this.enquiryCategoryModel.create(payload);
  }

  async findByIdAndUpdate(enquiryId, data) {
    try {
      return await this.enquiryCategoryModel.findByIdAndUpdate(
        enquiryId,
        data,
        { new: true },
      );
    } catch (err) {
      throw err;
    }
  }

  async findByIdAndDelete(enquiryId) {
    try {
      return await this.enquiryCategoryModel.findByIdAndDelete(enquiryId);
    } catch (err) {
      throw err;
    }
  }
}
