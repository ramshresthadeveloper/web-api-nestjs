import { Field, ID, Int, ObjectType, OmitType } from '@nestjs/graphql';
import { MetaForPagination } from '@src/announcement/dto/response/announcementlist.response';
import { CompanyEvent } from '@src/event/entities/event.entity';

@ObjectType()
export class SeenByInvestors {
  @Field({ nullable: true })
  investorId: string;
}

@ObjectType()
export class EventListWithoutSeenBy extends OmitType(CompanyEvent, [
  'eventSeenBy',
]) {}

@ObjectType()
export class ComapnyEventList {
  @Field(() => [EventListWithoutSeenBy])
  items: [EventListWithoutSeenBy];

  @Field(() => MetaForPagination)
  meta: MetaForPagination;
}
