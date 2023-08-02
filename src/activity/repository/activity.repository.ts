import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import { BaseRepository } from './base.repository';
import { Activity, ActivityDocument } from '@activity/entities/activity.entity';
import { Company, CompanyDocument } from '@company/entity/company.entity';
import { ActivityListInput } from '@activity/dto/input/activity-list.input';

@Injectable()
export class ActivityRepository extends BaseRepository {
  constructor(
    @InjectModel(Activity.name)
    private readonly activityModel: Model<ActivityDocument>,
    @InjectModel(Company.name)
    private readonly companyModel: Model<CompanyDocument>,
  ) {
    super(activityModel);
  }

  async create(data): Promise<Activity> {
    return await this.activityModel.create(data);
  }

  async bulkDelete(condition) {
    return await this.activityModel.deleteMany(condition);
  }

  async findActivitiesOfUser(userId, activitiesListInput: ActivityListInput) {
    const { page, limit } = activitiesListInput;
    const stages = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          companyId: 1,
          jobTitle: 1,
          activityDescription: 1,
          profileImage: '$user.profileImage',
          createdAt: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ];

    return await this.aggregatePaginate(stages, {
      page,
      limit,
    });
  }
}
