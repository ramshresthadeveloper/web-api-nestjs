import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Announcement,
  AnnouncementDocument,
} from '../entities/announcement.entity';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import Lang from '@src/constants/language';

@Injectable()
export class AnnouncementRepository extends BaseRepository {
  constructor(
    @InjectModel(Announcement.name)
    private announcementModel: Model<AnnouncementDocument>,
  ) {
    super(announcementModel);
  }

  async create(createAnnouncementDto): Promise<Announcement> {
    return await this.announcementModel.create(createAnnouncementDto);
  }

  async findMany(condition): Promise<Announcement[]> {
    return await this.announcementModel.find(condition);
  }

  async findOneAndUpdate(condition, data): Promise<Announcement> {
    return await this.announcementModel.findOneAndUpdate(condition, data, {
      new: true,
    });
  }

  async findOneAndDelete(condition): Promise<Announcement> {
    const announcement = await this.announcementModel.findOneAndDelete(
      condition,
    );
    if (!announcement) {
      throw new NotFoundException(Lang.ANNOUNCEMENT_NOT_FOUND);
    }
    return announcement;
  }

  async totalDraftAnnouncementOfCompany(companyId) {
    return await this.announcementModel
      .find({
        companyId,
        status: 'draft',
        deleted: false,
      })
      .count();
  }

  async bulkDelete(condition) {
    return await this.announcementModel.deleteMany(condition);
  }
  async getDataByCompanyIdOrAsx(companyId, asxCode) {
    let timedata = await this.announcementModel.findOne({
      companyId: companyId,
    });
    if (!timedata) {
      timedata = await this.announcementModel.findOne({ asxCode: asxCode });
    }
    return timedata;
  }
  async insertMany(data) {
    return await this.announcementModel.insertMany(data);
  }
  async updateMany(companyId, userId) {
    return await this.announcementModel.updateMany(
      { companyId: companyId },
      { $set: { userId: userId } },
    );
  }
  async findAndUpdate(condition, data) {
    return await this.announcementModel.updateMany(condition, data);
  }
}
