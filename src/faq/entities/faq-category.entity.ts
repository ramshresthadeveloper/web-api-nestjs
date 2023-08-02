import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export type FaqCategoryDocument = FaqCategory & Document;

@ObjectType()
@Schema({ timestamps: true })
export class FaqCategory {
  @Field((type) => ID, { nullable: true })
  _id: string;

  @Field({ nullable: true })
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
    required: true,
    trim: true,
  })
  name: string;

  @Field({ nullable: true })
  @Prop({
    type: Number,
  })
  displayOrder: number;
}

export const FaqCategorySchema = SchemaFactory.createForClass(FaqCategory);
