import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export type ActivityDocument = Activity & Document;

@ObjectType()
@Schema({ timestamps: true })
export class Activity {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true,
  })
  userId: string;

  @Field(() => ID)
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  })
  companyId: string;

  @Field()
  @Prop({
    type: String,
  })
  jobTitle: string;

  @Field()
  @Prop({
    type: String,
    trim: true,
    required: true,
  })
  activityDescription: string;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
