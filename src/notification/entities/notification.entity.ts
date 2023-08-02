import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

import {ENUM}from '@src/constants/dbEnum';

export type NotificationDocument = Notification & Document;

@ObjectType()
@Schema()
export class NotificationMetaData {
  @Field(() => ID, { nullable: true })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
  })
  userId: string;

  @Field(() => ID, { nullable: true })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  })
  companyId: string;

  @Field(() => ID, { nullable: true })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enquiry',
  })
  enquiryId: string;

  @Field(() => ID, { nullable: true })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyEvent',
  })
  eventId: string;

  @Field(() => ID, { nullable: true })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Announcement',
  })
  announcementId: string;

  @Field(() => ID, { nullable: true })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnquiryResponse',
  })
  enquiryResponseId: string;
}

const NotificationMetaDataSchema =
  SchemaFactory.createForClass(NotificationMetaData);

@ObjectType()
@Schema()
export class UserObject {
  @Field(() => ID,{ nullable: true })
  _id: string;

  @Field({ nullable: true })
  @Prop({
    type: String,
    required: true,
  })
  userName: string;

  @Field({ nullable: true })
  @Prop({
    type: String,
    required: true,
  })
  jobTitle: string;

  @Field({ nullable: true })
  @Prop({ type: String })
  profileImage: string;
}

const NotificationUserObjectSchema =
  SchemaFactory.createForClass(UserObject);


@ObjectType()
@Schema({ timestamps: true })
export class Notification {
  @Field(() => ID)
  _id: string;

  @Field(() => ID, { nullable: true })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  userId: string;

  @Field(() => ID, { nullable: true })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investor',
  })
  investorId: string;

  @Field(() => ID, { nullable: true })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  })
  companyId: string;

  @Field({ nullable: true })
  @Prop({
    type: Boolean,
    default: false,
  })
  hasRead: boolean;

  @Field({ nullable: true })
  @Prop({
    type: Boolean,
    default: false,
  })
  hasReadFromNotification: boolean;

  @Field({ nullable: true })
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  title: string;

  @Field({ nullable: true })
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  message: string;

  @Field({ nullable: true })
  @Prop({
    type: String,
    enum: ENUM.notificationType,
    required: true,
    trim: true,
  })
  notificationType: string;

  @Field(() => NotificationMetaData, { nullable: true })
  @Prop({
    type: NotificationMetaDataSchema,
    default: {},
  })
  metaData: NotificationMetaData;

  @Field(() => UserObject, { nullable: true })
  @Prop({
    type: NotificationUserObjectSchema,
    default: {},
  })
  userObject: UserObject;

  @Field()
  createdAt: Date;

  @Prop({ type: String, required: false, trim: true })
  attachment?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
