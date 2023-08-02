import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@src/auth/decorator/user.decorator';
import { GqlAuthGuard } from '@src/auth/guard/auth.guard';
import { User } from '@src/user/entities/user.entity';
import { CompanyEventDetailInput } from './dto/input/company-detail.input';
import { EventListInput } from './dto/input/company-event-list.input';
import { CompanyEventInput } from './dto/input/company-event.input';
import { CompanyEventEditInput } from './dto/input/compnay-event-edit.input';
import { ComapnyEventList } from './dto/response/event-list.response';
import { CompanyEvent } from './entities/event.entity';
import { CompanyEventService } from './event.service';

@Resolver()
export class CompanyEventResolver {
  constructor(private readonly companyEventService: CompanyEventService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => ComapnyEventList)
  async getCompanyEvents(
    @CurrentUser() user: User,
    @Args('eventsListInput') eventsListInput: EventListInput,
  ) {
    return this.companyEventService.getCompanyEvents(user, eventsListInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => CompanyEvent)
  async createCompanyEvent(
    @CurrentUser() user: User,
    @Args('eventInput') eventInput: CompanyEventInput,
  ) {
    return this.companyEventService.addCompanyEvent(user, eventInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => CompanyEvent)
  async updateCompanyEvent(
    @CurrentUser() user: User,
    @Args('eventInput') eventEditInput: CompanyEventEditInput,
  ) {
    return this.companyEventService.updateCompanyEvent(user, eventEditInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => CompanyEvent)
  async deleteCompanyEvent(
    @CurrentUser() user: User,
    @Args('eventInput') eventDeleteInput: CompanyEventDetailInput,
  ) {
    return this.companyEventService.deleteCompanyEvent(user, eventDeleteInput);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => CompanyEvent)
  async getCompanyEvent(
    @CurrentUser() user: User,
    @Args('eventInput') eventDetailInput: CompanyEventDetailInput,
  ) {
    return this.companyEventService.getCompanyEvent(user, eventDetailInput);
  }
}
