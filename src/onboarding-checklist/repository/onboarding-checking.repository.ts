import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  OnboardingChecklist,
  OnboardingChecklistDocument,
} from '../entities/onboarding-checklist.entity';
import { Model, Types, UpdateQuery } from 'mongoose';

@Injectable()
export class OnboardingChecklistRepository {
  constructor(
    @InjectModel(OnboardingChecklist.name)
    private readonly onboardingChecklistModel: Model<OnboardingChecklistDocument>,
  ) {}

  async getOnboardingChecklistData(companyId) {
    return await this.onboardingChecklistModel.findOne({
      companyId: companyId,
    });
  }

  async setOnboardingChecklistData(onboardingChecklistData: {
    addCompanyLogo: boolean;
    addCompanyBio: boolean;
    addExecutive: boolean;
    addFAQ: boolean;
    inviteInvestors: boolean;
    completionTime?: Date;
    companyId: Types.ObjectId;
  }) {
    return await this.onboardingChecklistModel.create(onboardingChecklistData);
  }

  async updateChecklistData(
    _id: any,
    data: {
      addCompanyLogo: boolean;
      addCompanyBio: boolean;
      addExecutive: boolean;
      addFAQ: boolean;
      inviteInvestors: boolean;
      completionTime?: Date;
    },
  ) {
    return await this.onboardingChecklistModel.findByIdAndUpdate(_id, data);
  }
}
