import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type EnquiryDocument = Enquiry & Document;

@ObjectType()
@Schema({ timestamps: true })
export class Enquiry {
  @Field(() => ID)
  _id: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  })
  companyId: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investor',
    required: true,
  })
  investorId: string;

  @Field()
  @Prop({ type: String, required: true, trim: true })
  subject: string;

  @Field()
  @Prop({ type: String, required: true, trim: true })
  question: string;

  @Field({ nullable: true })
  @Prop({ type: String, trim: true })
  audio: string;

  @Field()
  @Prop({
    type: String,
    enum: ['seen', 'responded', 'delivered','drafted'],
    default: 'delivered',
  })
  status: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnquiryCategory',
    index: true,
  })
  enquiryCategoryId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  assignedTo: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  resolvedBy: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  archivedBy: string;
}

export const EnquirySchema = SchemaFactory.createForClass(Enquiry);
