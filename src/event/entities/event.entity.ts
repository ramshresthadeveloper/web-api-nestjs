import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export type CompanyEventDocument = CompanyEvent & Document;

@ObjectType()
@Schema()
class EventSeen {
  @Field((type) => ID, { nullable: true })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investor',
    required: true,
  })
  investorId: string;

  @Field({ nullable: true })
  @Prop({
    type: Date,
    required: true,
  })
  seenAt: Date;
}

const EventSeenSchema = SchemaFactory.createForClass(EventSeen);
@ObjectType()
@Schema({ timestamps: true })
export class CompanyEvent {
  @Field((type) => ID)
  _id: string;

  @Field((type) => ID)
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true,
  })
  userId: string;

  @Field((type) => ID)
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    index: true,
    required: true,
  })
  companyId: string;

  @Field()
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  title: string;

  @Field()
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  description: string;

  @Field({ nullable: true })
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  location: string;

  @Field({ nullable: true })
  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  allDay: boolean;

  @Field({ nullable: true })
  @Prop({
    type: Date,
    required: true,
  })
  date: Date;

  @Field({ nullable: true, defaultValue:null})
  @Prop({
    type: Date,
    required: false,
  })
  endDate?: Date;

  @Field({ nullable: true })
  @Prop({
    type: String,
    enum: ['admin', 'investors', 'both'],
    required: true,
  })
  eventAttendies: string;

  @Field((type) => String, { nullable: true })
  @Prop({
    type: String,
  })
  attachment: string;

  @Field({ nullable: true })
  @Prop({
    type: Date,
    required: false,
  })
  publishedDate: Date;

  @Field({ nullable: true })
  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  deleted: boolean;

  @Field({ nullable: true })
  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  isHoliday: boolean;

  @Field({ nullable: true })
  @Prop({
    type: Date,
    required: false,
    trim: true,
  })
  startTime: Date;

  @Field({ nullable: true })
  @Prop({
    type: Date,
    required: false,
    trim: true,
  })
  endTime: Date;

  @Field((type) => [EventSeen])
  @Prop({
    type: [EventSeenSchema],
    default: [],
  })
  eventSeenBy: EventSeen[];
}

export const CompanyEventSchema = SchemaFactory.createForClass(CompanyEvent);
