import { CompanyIdInput } from '@executive-team/dto/input/company.input.id';
import { Args, Query, Resolver, Mutation } from '@nestjs/graphql';
import { OnboardingChecklistService } from './service/onboarding-checklist.service';
import { GqlAuthGuard } from '@auth/guard/auth.guard';
import { UseGuards } from '@nestjs/common';
import { OnboardingChecklistResponse } from './dto/response/onboarding-checklist.response';
import { CurrentUser } from '@auth/decorator/user.decorator';
import { User } from '@user/entities/user.entity';

@Resolver()
export class OnboardingChecklistResolver {
  constructor(
    private readonly onboardingChecklistService: OnboardingChecklistService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => OnboardingChecklistResponse)
  async getOnboardingChecklistData(
    @CurrentUser() user: User,
    @Args('onboardingChecklistDataInput') companyIdInput: CompanyIdInput,
  ) {
    return await this.onboardingChecklistService.getOnBoardingChecklistData(
      user,
      companyIdInput,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => OnboardingChecklistResponse)
  async updateInviteInvestorChecklist(
    @CurrentUser() user: User,
    @Args('updateInviteInvestorChecklistInput') companyIdInput: CompanyIdInput,
  ) {
    return await this.onboardingChecklistService.updateInviteInvestorsData(
      user,
      companyIdInput,
    );
  }
}
