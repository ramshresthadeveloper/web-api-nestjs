import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type FaqDocument = Faq & Document;

@ObjectType()
@Schema({ timestamps: true })
export class Faq {
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FaqCategory',
    index: true,
    required: true,
  })
  faqCategoryId: string;

  @Field({ nullable: true })
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  question: string;

  @Field({ nullable: true })
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  answer: string;

  @Field({ nullable: true })
  @Prop({
    type: Number,
  })
  displayOrder: number;
}

export const FaqSchema = SchemaFactory.createForClass(Faq);
