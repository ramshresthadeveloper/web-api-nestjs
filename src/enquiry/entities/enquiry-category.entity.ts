import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export type EnquiryCategoryDocument = EnquiryCategory & Document;

@ObjectType()
@Schema({ timestamps: true })
export class EnquiryCategory {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Field(() => ID)
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  })
  companyId: string;

  @Field(() => ID)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  createdBy: string;
}

export const EnquiryCategorySchema =
  SchemaFactory.createForClass(EnquiryCategory);
