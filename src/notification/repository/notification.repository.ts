import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Notification,
  NotificationDocument,
} from '@notification/entities/notification.entity';
import { BaseRepository } from './base.repository';
import mongoose from 'mongoose';
import { ObjectId, ObjectIdLike } from 'bson';

@Injectable()
export class NotificationRepository extends BaseRepository {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {
    super(notificationModel);
  }

  async create(createAnnouncementDto): Promise<Notification> {
    return await this.notificationModel.create(createAnnouncementDto);
  }

  async findMany(condition): Promise<Notification[]> {
    return await this.notificationModel.find(condition);
  }

  async bulkDelete(condition) {
    return await this.notificationModel.deleteMany(condition);
  }

  async getUnreadNotificationCount(userId: string, companyId: string) {
    return await this.notificationModel
      .find({
        userId,
        companyId,
        hasReadFromNotification: false,
      })
      .count();
  }

  async resetNotificationCounter({ companyId, userId }) {
    return this.notificationModel.updateMany(
      {
        userId: userId,
        companyId: companyId,
        hasReadFromNotification: false,
      },
      {
        hasReadFromNotification: true,
      },
    );
  }

  async setMultipleNotificationRead({ companyId, userId }) {
    return this.notificationModel.updateMany(
      {
        userId: userId,
        companyId: companyId,
        hasRead: false,
      },
      {
        hasRead: true,
      },
    );
  }

  async makeNotificationRead(notificationId) {
    return this.notificationModel.findByIdAndUpdate(
      notificationId,
      {
        hasRead: true,
        hasReadFromNotification: true,
      },
      { new: true },
    );
  }

  async checkIfAllNotificationRead({ companyId, userId }) {
    const unreadNotificationCount = await this.notificationModel
      .find({
        userId,
        companyId,
        hasRead: false,
      })
      .count();

    return unreadNotificationCount > 0 ? false : true;
  }
}
