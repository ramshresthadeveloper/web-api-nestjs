import { CompanyRepository } from '@src/company/repository/company.repository';
import { User } from '@src/user/entities/user.entity';
import { CompanyIdInput } from '@executive-team/dto/input/company.input.id';
import { OnboardingChecklistRepository } from './../repository/onboarding-checking.repository';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { ExecutiveTeamRepository } from '@executive-team/repository/executive.team.repository';
import { FaqRepository } from '@faq/repositories/faq.repository';
import Lang from '@src/constants/language';
import { DateTime } from 'luxon';

interface OnboardingChecklistData {
  addCompanyLogo: boolean;
  addCompanyBio: boolean;
  addExecutive: boolean;
  addFAQ: boolean;
  inviteInvestors: boolean;
  completionTime?: Date;
  showOnboardingChecklist: boolean;
}

@Injectable()
export class OnboardingChecklistService {
  constructor(
    private readonly onboardingChecklistRepository: OnboardingChecklistRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly executiveTeamRepository: ExecutiveTeamRepository,
    private readonly faqRepository: FaqRepository,
  ) {}

  async getOnBoardingChecklistData(user: User, companyIdInput: CompanyIdInput) {
    await this.validateUserAndCompany(user, companyIdInput);

    const companyId = new mongoose.Types.ObjectId(companyIdInput.companyId);
    const onboardingData =
      await this.onboardingChecklistRepository.getOnboardingChecklistData(
        companyId,
      );

    let onboardingChecklistData: OnboardingChecklistData = {
      addCompanyLogo: false,
      addCompanyBio: false,
      addExecutive: false,
      addFAQ: false,
      inviteInvestors: false,
      showOnboardingChecklist: true,
    };

    if (onboardingData) {
      ({
        addCompanyLogo: onboardingChecklistData.addCompanyLogo,
        addCompanyBio: onboardingChecklistData.addCompanyBio,
        addExecutive: onboardingChecklistData.addExecutive,
        addFAQ: onboardingChecklistData.addFAQ,
        inviteInvestors: onboardingChecklistData.inviteInvestors,
        completionTime: onboardingChecklistData.completionTime,
      } = onboardingData);
      if (onboardingChecklistData.completionTime) {
        const CHECKLIST_SHOW_TIME_AFTER_COMPLTION = 72;
        // Check if completionTime has passed 72 hours
        const currentTime = DateTime.now();
        const completionDateTime = DateTime.fromJSDate(
          onboardingChecklistData.completionTime,
        );

        const completionDifference = currentTime.diff(
          completionDateTime,
          'hours',
        ).hours;
        if (completionDifference >= CHECKLIST_SHOW_TIME_AFTER_COMPLTION) {
          onboardingChecklistData.showOnboardingChecklist = false;
        }
      }
    } else {
      await this.createNewOnboardingChecklistData(
        companyId,
        onboardingChecklistData,
      );
    }
    return { ...onboardingChecklistData };
  }

  async updateInviteInvestorsData(user: User, companyIdInput: CompanyIdInput) {
    await this.validateUserAndCompany(user, companyIdInput);

    const companyId = new mongoose.Types.ObjectId(companyIdInput.companyId);
    const onboardingData =
      await this.onboardingChecklistRepository.getOnboardingChecklistData(
        companyId,
      );

    let onboardingChecklistData: OnboardingChecklistData = {
      addCompanyLogo: false,
      addCompanyBio: false,
      addExecutive: false,
      addFAQ: false,
      inviteInvestors: false,
      showOnboardingChecklist: true,
    };

    if (onboardingData) {
      if (onboardingData.inviteInvestors) {
        throw new ConflictException(
          Lang.INVITE_INVESTOR_CHECKLIST_ALREADY_COMPLETED,
        );
      }
      onboardingChecklistData.inviteInvestors = true;
      ({
        addCompanyLogo: onboardingChecklistData.addCompanyLogo,
        addCompanyBio: onboardingChecklistData.addCompanyBio,
        addExecutive: onboardingChecklistData.addExecutive,
        addFAQ: onboardingChecklistData.addFAQ,
      } = onboardingData);

      const isChecklistComplete =
        onboardingChecklistData.addCompanyBio &&
        onboardingChecklistData.addCompanyLogo &&
        onboardingChecklistData.addExecutive &&
        onboardingChecklistData.addFAQ &&
        onboardingChecklistData.inviteInvestors;

      if (isChecklistComplete) {
        onboardingChecklistData.completionTime = DateTime.now().toJSDate();
      }
      await this.onboardingChecklistRepository.updateChecklistData(
        onboardingData._id,
        { ...onboardingChecklistData },
      );
    } else {
      onboardingChecklistData.inviteInvestors = true;
      await this.createNewOnboardingChecklistData(
        companyId,
        onboardingChecklistData,
      );
    }
    return { ...onboardingChecklistData };
  }

  async updateCompanyChecklistData(
    companyId: string,
    data: {
      addCompanyBio?: boolean;
      addCompanyLogo?: boolean;
      addExecutive?: boolean;
      addFAQ?: boolean;
    },
  ) {
    const onboardingData =
      await this.onboardingChecklistRepository.getOnboardingChecklistData(
        new mongoose.Types.ObjectId(companyId),
      );

    if (onboardingData && !onboardingData.completionTime) {
      const {
        addCompanyBio,
        addCompanyLogo,
        addExecutive,
        addFAQ,
        inviteInvestors,
      } = onboardingData;

      const updatedCheckListData: OnboardingChecklistData = {
        addCompanyBio: addCompanyBio || data.addCompanyBio || false,
        addCompanyLogo: addCompanyLogo || data.addCompanyLogo || false,
        addExecutive: addExecutive || data.addExecutive || false,
        addFAQ: addFAQ || data.addFAQ || false,
        inviteInvestors,
        showOnboardingChecklist: true,
      };

      const isChecklistComplete =
        updatedCheckListData.addCompanyBio &&
        updatedCheckListData.addCompanyLogo &&
        updatedCheckListData.addExecutive &&
        updatedCheckListData.addFAQ &&
        updatedCheckListData.inviteInvestors;

      if (isChecklistComplete) {
        updatedCheckListData.completionTime = DateTime.now().toJSDate();
      }

      await this.onboardingChecklistRepository.updateChecklistData(
        onboardingData._id,
        updatedCheckListData,
      );
    }
  }

  private async createNewOnboardingChecklistData(
    companyId: mongoose.Types.ObjectId,
    onboardingChecklistData: OnboardingChecklistData,
  ) {
    const companyData = await this.companyRepository.findOne({
      _id: companyId,
    });
    const executiveTeamMembersCount =
      await this.executiveTeamRepository.getExecutiveMembersCount(companyId);
    const faqCount = await this.faqRepository.getFaqCount(companyId);

    onboardingChecklistData.addCompanyLogo = !!companyData.companyLogo;
    onboardingChecklistData.addCompanyBio = !!companyData.about;
    onboardingChecklistData.addExecutive = executiveTeamMembersCount > 0;
    onboardingChecklistData.addFAQ = faqCount > 0;

    await this.onboardingChecklistRepository.setOnboardingChecklistData({
      companyId,
      ...onboardingChecklistData,
    });
  }

  private async validateUserAndCompany(
    user: User,
    companyIdInput: CompanyIdInput,
  ) {
    const companyData = await this.companyRepository.isCompanyAdmin(
      user._id,
      companyIdInput.companyId,
    );
    //Check if the current user is superadmin or not
    if (!companyData) {
      throw new ForbiddenException(Lang.NO_ACCESS);
    }
  }
}
