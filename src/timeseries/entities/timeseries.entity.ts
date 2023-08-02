import { Field } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export type TimeseriesDocument = Timeseries & Document;

@Schema({ timestamps: true })
export class Timeseries {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    index: true,
    required: true,
  })
  companyId: string;

  @Field({ nullable: true })
  @Prop({
    type: String,
  })
  asxCode: string;

  @Field()
  @Prop({
    type: Number,
    required: true,
  })
  open: number;

  @Field()
  @Prop({
    type: Number,
    required: true,
  })
  close: number;

  @Field()
  @Prop({
    type: Number,
    required: true,
  })
  high: number;

  @Field()
  @Prop({
    type: Number,
    required: true,
  })
  low: number;

  @Field()
  @Prop({
    type: String,
    required: true,
  })
  timestamp: string;
}

export const TimeseriesSchema = SchemaFactory.createForClass(Timeseries);
