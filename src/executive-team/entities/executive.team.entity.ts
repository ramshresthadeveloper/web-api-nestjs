import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export type ExecutiveTeamDocument = ExecutiveTeam & Document;

@ObjectType()
@Schema()
export class ExecutiveTeam {
  @Field(() => ID)
  _id: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  })
  companyId: string;

  @Field()
  @Prop({ type: String, required: true, trim: true, length: 55 })
  name: string;

  @Field()
  @Prop({ type: String, required: true, trim: true })
  role: string;

  @Field({ nullable: true, defaultValue: '' })
  @Prop({ type: String, trim: true })
  linkedIn: string;

  @Field()
  @Prop({ type: String, required: true, trim: true })
  digitalPicture: string;
}

export const ExecutiveTeamSchema = SchemaFactory.createForClass(ExecutiveTeam);
