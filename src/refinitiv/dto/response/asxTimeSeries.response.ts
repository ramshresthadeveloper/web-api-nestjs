import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AsxTimeSeriesData {
  @Field({ nullable: true })
  OPEN: string;

  @Field({ nullable: true })
  HIGH: string;

  @Field({ nullable: true })
  LOW: string;

  @Field({ nullable: true })
  CLOSE: string;

  @Field({ nullable: true })
  VOLUME: string;

  @Field({ nullable: true })
  BID: string;

  @Field({ nullable: true })
  TIMESTAMP: string;
}
