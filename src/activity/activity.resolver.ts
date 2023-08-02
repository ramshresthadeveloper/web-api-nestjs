import { CurrentUser } from '@auth/decorator/user.decorator';
import { GqlAuthGuard } from '@auth/guard/auth.guard';
import { UseGuards } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';
import { Resolver } from '@nestjs/graphql';
import { User } from '@src/user/entities/user.entity';
import { ActivityService } from './activity.service';
import { ActivityListInput } from './dto/input/activity-list.input';
import { ActivityList } from './dto/response/activity-list.response';

@Resolver()
export class ActivityResolver {
  constructor(private readonly acitivityService: ActivityService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => ActivityList)
  getActivities(
    @CurrentUser() user: User,
    @Args('activitiesListInput') activitiesListInput: ActivityListInput,
  ) {
    return this.acitivityService.getActivity(user, activitiesListInput);
  }
}
