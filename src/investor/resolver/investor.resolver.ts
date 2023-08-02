import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { Message } from '@src/admin/dto/response/message.response';
import { CurrentUser } from '@src/auth/decorator/user.decorator';
import { GqlAuthGuard } from '@src/auth/guard/auth.guard';
import { User } from '@src/user/entities/user.entity';
import { CompanyIdOnlyInput } from '../dto/input/companyId-only.input';
import { TotalInterestedAndInvestedInvestorResponse } from '../dto/response/totalInterestedAndInvestested-investor.response';
import { InvestorService } from '../service/investor.service';

@Resolver()
export class InvestorResolver {
  constructor(private readonly investorService: InvestorService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => TotalInterestedAndInvestedInvestorResponse)
  getTotalInterestedAndInvestedInvestor(
    @CurrentUser() user: User,
    @Args('CompanyIdOnlyInput') companyIdOnlyInput: CompanyIdOnlyInput,
  ) {
    return this.investorService.getTotalInterestedAndInvestedInvestor(
      user,
      companyIdOnlyInput,
    );
  }
}
