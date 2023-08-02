import { CompanyRepository } from '@company/repository/company.repository';
import { Injectable } from '@nestjs/common';
import { User } from '@src/user/entities/user.entity';
import { ActivityListInput } from './dto/input/activity-list.input';
import { ActivityRepository } from './repository/activity.repository';

@Injectable()
export class ActivityService {
  constructor(
    private readonly activityRepo: ActivityRepository,
    private readonly companyRepo: CompanyRepository,
  ) {}

  async createActivity(activityData) {
    try {
      const { userId, companyId, isTeamMember, activityDescription, jobTitle } =
        activityData;

      let companyJobTitle;

      if (isTeamMember) {
        const teamMember = await this.companyRepo.teamMemberDetailWithUserId(
          companyId,
          userId,
        );
        companyJobTitle =
          teamMember.length > 0 ? teamMember[0].jobTitleInCompany : '';
      }

      return await this.activityRepo.create({
        userId,
        companyId,
        jobTitle: isTeamMember ? companyJobTitle : jobTitle || 'Company Admin',
        activityDescription,
      });
    } catch (err) {
      throw err;
    }
  }

  async getActivity(user: User, activitiesListInput: ActivityListInput) {
    try {
      const activites = await this.activityRepo.findActivitiesOfUser(
        user._id,
        activitiesListInput,
      );
      return activites;
    } catch (err) {
      throw err;
    }
  }
}
