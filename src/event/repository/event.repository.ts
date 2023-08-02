import { Company, CompanyDocument } from '@company/entity/company.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { CompanyEvent, CompanyEventDocument } from '../entities/event.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class CompanyEventRepository extends BaseRepository {
  constructor(
    @InjectModel(CompanyEvent.name)
    private companyEventModel: Model<CompanyEventDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  ) {
    super(companyEventModel);
  }

  async create(createAnnouncementDto): Promise<CompanyEvent> {
    return await this.companyEventModel.create(createAnnouncementDto);
  }

  async findMany(condition): Promise<CompanyEvent[]> {
    return await this.companyEventModel.find(condition);
  }

  async findOne(condition, select = null) {
    const result = this.companyEventModel.findOne(condition).lean();
    if (select) {
      result.select(select);
    }
    return result.exec();
  }

  async findOneAndUpdate(condition, data): Promise<CompanyEvent> {
    return await this.companyEventModel.findOneAndUpdate(condition, data, {
      new: true,
    });
  }

  async findOneAndDelete(condition): Promise<CompanyEvent> {
    return await this.companyEventModel.findOneAndDelete(condition);
  }

  async bulkDelete(condition) {
    return await this.companyEventModel.deleteMany(condition);
  }

  async canModifyEvent(eventId, userId, companyId) {
    try {
      const [company, event] = await Promise.all([
        await this.companyModel.findOne({
          _id: companyId,
          $or: [
            { userId: userId },
            {
              teamMembers: {
                $elemMatch: {
                  userId,
                  permissions: {
                    $elemMatch: { name: 'administrative', allowed: true },
                  },
                },
              },
            },
          ],
        }),
        await this.companyEventModel.findOne({
          _id: eventId,
          userId,
        }),
      ]);

      if (company || event) {
        return true;
      }

      return false;
    } catch (err) {
      throw err;
    }
  }
}
