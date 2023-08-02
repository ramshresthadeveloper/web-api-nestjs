import { Body, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '@auth/decorator/user.decorator';
import { GqlAuthGuard } from '@auth/guard/auth.guard';
import { User } from '@src/user/entities/user.entity';
import { NotificationListInput } from './dto/input/notification-list.input';
import { NotificationList } from './dto/response/notification-list.response';
import { NotificationService } from './services/notification.service';
import { Message } from '@admin/dto/response/message.response';
import { NotificationIdOnlyInput } from './dto/input/notificationId.input';
import { UnreadNotificationCountResponse } from './dto/response/unread.notification.count.response';
import { UnreadNotificationInput } from './dto/input/unread.notification.input';
import { CompanyIdInput } from '@executive-team/dto/input/company.input.id';

@Resolver()
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => NotificationList)
  getNotifications(
    @CurrentUser() user: User,
    @Args('notificationListInput') notificationListInput: NotificationListInput,
  ) {
    return this.notificationService.getNotifications(
      user,
      notificationListInput,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Message)
  readNotification(
    @CurrentUser() user: User,
    @Args('notificaion') notificationInput: NotificationIdOnlyInput,
  ) {
    return this.notificationService.readNotification(notificationInput);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Message)
  markAllNotificationAsRead(
    @Args('markAllNotificationAsRead')
    unreadNotificationInput: CompanyIdInput,
    @CurrentUser() user: User,
  ) {
    return this.notificationService.markAllNotificationAsRead(
      user._id,
      unreadNotificationInput.companyId,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => UnreadNotificationCountResponse)
  getUnreadNotificationCount(
    @Args('unreadNotificationCount')
    unreadNotificationInput: UnreadNotificationInput,
    @CurrentUser() user: User,
  ) {
    return this.notificationService.getUnreadNotification(
      user._id,
      unreadNotificationInput.companyId,
    );
  }
}
