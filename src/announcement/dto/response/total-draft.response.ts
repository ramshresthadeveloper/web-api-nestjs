import { Field, Int, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';

@ObjectType()
export class TotalDraftCount {
  @Field()
  @IsNumber()
  totalDrafts: number;
}
