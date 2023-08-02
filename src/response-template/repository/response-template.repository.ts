import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import { BaseRepository } from '@enquiry/repository/base.repository';

import {
  ResponseTemplate,
  ResponseTemplateDocument,
} from '../entities/response-template.entity';

@Injectable()
export class ResponseTemplateRepository extends BaseRepository {
  constructor(
    @InjectModel(ResponseTemplate.name)
    private readonly responseTemplateModel: Model<ResponseTemplateDocument>,
  ) {
    super(responseTemplateModel);
  }

  async create(payload): Promise<ResponseTemplate> {
    return await this.responseTemplateModel.create(payload);
  }

  async findByIdAndUpdate(responseTemplateId, data): Promise<ResponseTemplate> {
    return await this.responseTemplateModel.findByIdAndUpdate(
      responseTemplateId,
      data,
      {
        new: true,
      },
    );
  }

  async deleteResponseTemplate(responseTemplateId): Promise<ResponseTemplate> {
    return await this.responseTemplateModel.findByIdAndDelete(
      responseTemplateId,
    );
  }

  async bulkCreate(bulkData) {
    return await this.responseTemplateModel.insertMany(bulkData);
  }
}
