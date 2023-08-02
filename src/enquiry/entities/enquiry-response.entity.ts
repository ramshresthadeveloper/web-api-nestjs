import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import * as mongoose from 'mongoose';
import {ENUM}from '@src/constants/dbEnum';
import { Document } from 'mongoose';

export type EnquiryResponseDocument = EnquiryResponse & Document;
@ObjectType()
@Schema({ timestamps: true })
export class EnquiryResponse {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enquiry',
    required: true,
    index: true,
  })
  enquiryId: string;

  @Field()
  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Field()
  @Prop({ type: String, required: true, trim: true })
  content: string;

  @Field({ nullable: true })
  @Prop({ type: String, enum: ENUM.rating, trim: true })
  rating: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  respondedBy: string;

  @Field(() => [String], { nullable: true })
  @Prop({
    type: [String],
    validate: {
      validator: (value) => Promise.resolve(value.length <= 5),
      message: 'Upto 5 images can be uploaded',
    },
  })
  attachments: string[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investor',
    required: true,
  })
  investorId: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  })
  companyId: string;
}

export const EnquiryResponseSchema =
  SchemaFactory.createForClass(EnquiryResponse);
