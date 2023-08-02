import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
export type IssueDocument = Issue & Document;
@ObjectType()
@Schema({ timestamps: true })
export class Issue {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Field()
  @Prop({ type: String, required: true, trim: true })
  description: string;

  @Field({ nullable: true })
  @Prop({
    type: String,
    enum: ['company-user', 'investor'],
  })
  userType: string;

  @Field()
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investor',
  })
  investorId: string;

  @Field()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  companyUserId: string;

  @Field({ nullable: true })
  @Prop({ type: String, trim: true })
  attachment: string;

  @Prop({ type: Boolean, default: false })
  hasRead: boolean;

  @Field({ nullable: true, defaultValue:false })
  @Prop({ type: Boolean, default: false })
  isOther: boolean;
}
export const IssueSchema = SchemaFactory.createForClass(Issue);
