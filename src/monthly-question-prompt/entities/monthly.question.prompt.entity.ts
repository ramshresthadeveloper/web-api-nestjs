import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MonthlyPromptStatus } from '@src/constants/dbEnum';
import { boolean, string } from 'joi';
import mongoose, { Document } from 'mongoose';

export type MonthlyQuestionPromptDocument = MonthlyQuestionPrompt & Document;

@ObjectType()
@Schema()
class MonthlyQuestionPromptSeen {
  @Field((type) => ID, { nullable: true })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investor',
    required: true,
  })
  investorId: string;

  @Field({ nullable: true })
  @Prop({
    type: Date,
    required: true,
  })
  seenAt: Date;
}

const MonthlyQuestionPromptSeenSchema = SchemaFactory.createForClass(
  MonthlyQuestionPromptSeen,
);

@ObjectType()
@Schema({ timestamps: true })
export class MonthlyQuestionPrompt {
  @Field()
  @Prop({ type: String, required: true })
  question: string;

  @Field()
  @Prop({
    type: String,
    enum: MonthlyPromptStatus,
    required: true,
  })
  status: MonthlyPromptStatus;

  @Field({ nullable: true })
  @Prop({
    type: Date,
    required: false,
  })
  publishedDate: Date;

  @Field(() => ID, { nullable: true })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false,
  })
  publishedBy: string;

  @Field()
  @Prop({ type: Number, default: 0 })
  totalCopiedTimes: number;

  @Field((type) => [MonthlyQuestionPromptSeen])
  @Prop({ type: [MonthlyQuestionPromptSeenSchema], default: [] })
  monthlyQuestionPromptSeen: MonthlyQuestionPromptSeen[];
}

export const MonthlyQuestionPromptSchema = SchemaFactory.createForClass(
  MonthlyQuestionPrompt,
);
