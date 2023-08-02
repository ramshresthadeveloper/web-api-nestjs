import { Field, Int, ObjectType, OmitType } from '@nestjs/graphql';
import { Announcement } from '@src/announcement/entities/announcement.entity';

@ObjectType()
export class SeenByInvestors {
  @Field({ nullable: true })
  investorId: string;
}

@ObjectType()
export class MetaForPagination {
  @Field(() => Int)
  itemCount: number;

  @Field(() => Int)
  totalItems: number;

  @Field(() => Int)
  itemsPerPage: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  currentPage: number;
}

@ObjectType()
export class AnnouncementListWithoutSeenBy extends OmitType(Announcement, [
  'announcementSeenBy',
]) {
  @Field({ nullable: true })
  seenPercentage: number;
}

@ObjectType()
export class AnnouncementList {
  @Field(() => [AnnouncementListWithoutSeenBy])
  items: [AnnouncementListWithoutSeenBy];

  @Field(() => MetaForPagination)
  meta: MetaForPagination;
}
