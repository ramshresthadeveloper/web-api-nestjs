import { Activity } from '@activity/entities/activity.entity';
import { MetaForPagination } from '@announcement/dto/response/announcementlist.response';
import { Field, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@ObjectType()
export class Activities extends Activity {
  @Field({ nullable: true })
  @IsString()
  profileImage: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class ActivityList {
  @Field(() => [Activities])
  items: [Activities];

  @Field(() => MetaForPagination)
  meta: MetaForPagination;
}
