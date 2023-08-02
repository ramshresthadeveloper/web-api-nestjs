import { Field, InputType } from '@nestjs/graphql';
import { IsIn, IsMongoId, IsString } from 'class-validator';

@InputType()
export class EngagementInput {
  @Field()
  @IsMongoId()
  companyId: string;

  @Field()
  @IsString()
  @IsIn(['7Days', 'Month', '6Months'])
  timeRange: string;

  @Field()
  @IsString()
  @IsIn(['events', 'company-views', 'announcements'])
  dataType: string;
}
