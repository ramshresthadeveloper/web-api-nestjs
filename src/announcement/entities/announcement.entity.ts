import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export type AnnouncementDocument = Announcement & Document;

@ObjectType()
@Schema()
class AnnouncementSeen {
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

const AnnouncementSeenSchema = SchemaFactory.createForClass(AnnouncementSeen);
@ObjectType()
@Schema({ timestamps: true })
export class Announcement {
  @Field(() => ID)
  _id: string;

  @Field(() => ID, { nullable: true })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: false,
  })
  userId: string;

  @Field(() => ID)
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
    trim: true,
    index: true,
  })
  asxCode: string;

  @Field({ nullable: true })
  @Prop({
    type: String,
    index: true,
  })
  announcementId: string;

  @Field()
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  title: string;

  @Field({ nullable: true })
  @Prop({
    type: String,
  })
  attachment: string;

  @Field({ nullable: true })
  @Prop({
    type: String,
  })
  attachmentThumbnail: string;

  @Field({ nullable: true })
  @Prop({
    type: Number,
  })
  attachmentDuration: number;

  @Field({ nullable: true, defaultValue: 0 })
  @Prop({
    type: Number,
    required: false,
    trim: true,
  })
  attachmentSize?: number;

  @Field((type) => Int, { nullable: true })
  @Prop({
    type: Number,
    required: false,
    trim: true,
  })
  attachmentTotalPages: number;

  @Field(() => Boolean, { nullable: true })
  @Prop({ type: Boolean, default: false, enum: ['true', 'false'] })
  media: boolean;

  @Field()
  @Prop({
    type: String,
    enum: ['draft', 'published'],
    required: true,
  })
  status: string;

  @Field({ nullable: true })
  @Prop({
    type: Date,
    required: false,
  })
  publishedDate: Date;

  @Field()
  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  deleted: boolean;

  @Field()
  @Prop({
    type: Boolean,
    required: true,
  })
  fromAsx: boolean;

  @Field({ nullable: true })
  @Prop({ type: Boolean, default: false })
  starred: boolean;

  @Field()
  createdAt: Date;

  @Field({ nullable: false, defaultValue: 0 })
  @Prop({
    type: Number,
    default: 0,
  })
  totalViews: number;

  @Field(() => [AnnouncementSeen])
  @Prop({
    type: [AnnouncementSeenSchema],
    default: [],
  })
  announcementSeenBy: AnnouncementSeen[];

  @Field({ nullable: true, defaultValue: false })
  @Prop({
    type: Boolean,
    default: false,
  })
  isPinned: boolean;
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);
