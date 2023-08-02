import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import {ENUM}from '@src/constants/dbEnum';

export type InvestorDocument = Investor & Document;

@Schema({ timestamps: true })
class InvestorCompany {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  })
  _id: string;

  @Prop({ type: String, enum: ENUM.companyType, required: true })
  type: string;
}
const InvestorCompanySchema = SchemaFactory.createForClass(InvestorCompany);

@ObjectType()
@Schema({ timestamps: true })
export class Investor {
  @Field(() => ID)
  _id: string;

  @Field({ nullable: true })
  @Prop({ type: String, trim: true })
  firstName: string;

  @Field({ nullable: true })
  @Prop({ type: String, trim: true })
  lastName: string;

  @Field({ nullable: true })
  @Prop({
    type: String,
    minlength: 2,
    maxlength: 55,
    trim: true,
    sparse: true,
    index: true,
  })
  userName: string;

  @Field({ nullable: true })
  @Prop({
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    sparse: true,
    index: true,
  })
  email: string;

  @Prop({ type: String, trim: true })
  password: string;

  @Field({ nullable: true })
  @Prop({ type: String, trim: true, unique: true, sparse: true, index: true })
  mobileNum: string;

  @Prop({ type: String, trim: true, index: true })
  facebookId: string;

  @Prop({ type: String, trim: true, index: true })
  googleId: string;

  @Prop({ type: String, trim: true, index: true })
  appleId: string;

  @Field(() => Boolean)
  @Prop({ type: Boolean, enum: [true, false], default: 'false' })
  communicationConsent: boolean;

  @Field({ nullable: true })
  @Prop({ type: Date, default: null })
  verifiedAt: Date;

  @Field({ nullable: true })
  @Prop({ type: String, trim: true })
  profileImage: string;

  @Field({ nullable: true })
  @Prop({ type: Date, default: null })
  lastLoggedInAt: Date;

  @Field(() => Boolean)
  @Prop({ type: Boolean, enum: [true, false], default: 'true' })
  acceptedTAndC: boolean;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
      },
    ],
  })
  investedCompanies: string[];

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
      },
    ],
  })
  interestedCompanies: string[];

  @Field(() => Boolean)
  @Prop({
    type: Boolean,
    enum: [true, false],
    default: 'true',
  })
  receiveNotification: boolean;

  @Field()
  @Prop({
    type: String,
    enum: ENUM.registeredFrom,
    default: 'normal',
  })
  registeredFrom: string;

  @Prop({ type: [InvestorCompanySchema] })
  companyList: InvestorCompany[];
}

export const InvestorSchema = SchemaFactory.createForClass(Investor);
