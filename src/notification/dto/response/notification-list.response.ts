import { Field, ObjectType } from '@nestjs/graphql';

import { MetaForPagination } from '@announcement/dto/response/announcementlist.response';
import { Notification } from '@notification/entities/notification.entity';

@ObjectType()
export class NotificationList {
  @Field(() => Boolean)
  isAllread: boolean;

  @Field(() => [Notification])
  items: [Notification];

  @Field(() => MetaForPagination)
  meta: MetaForPagination;
}
