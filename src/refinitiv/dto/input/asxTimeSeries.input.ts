import { Field, InputType } from '@nestjs/graphql';
import { IsDate, IsNotEmpty } from 'class-validator';

@InputType()
export class AsxTimeSeriesInput {
  @Field()
  @IsNotEmpty()
  symbol: string;

  @Field()
  @IsNotEmpty()
  interval: string;

  @Field()
  @IsDate()
  startTime: Date;

  @Field()
  @IsDate()
  endTime: Date;
}
