import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EngagementData {
  @Field()
  totalSeen: number;

  @Field()
  seenPercentage: number;

  @Field()
  date: string;
}

@ObjectType()
export class EngagementResponse {
  @Field((type) => [EngagementData])
  data: [EngagementData];

  @Field()
  changeInEngagementLevel: string;
}
