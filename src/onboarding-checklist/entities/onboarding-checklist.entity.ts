import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type OnboardingChecklistDocument = OnboardingChecklist & Document;

@Schema({ timestamps: true })
export class OnboardingChecklist {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  })
  companyId: string;

  @Prop({ type: Boolean, default: false })
  addCompanyLogo: boolean;

  @Prop({ type: Boolean, default: false })
  addCompanyBio: boolean;

  @Prop({ type: Boolean, default: false })
  addExecutive: boolean;

  @Prop({ type: Boolean, default: false })
  addFAQ: boolean;

  @Prop({ type: Boolean, default: false })
  inviteInvestors: boolean;

  @Prop({ type: Date, required: false })
  completionTime: Date;
}

export const OnboardingChecklistSchema =
  SchemaFactory.createForClass(OnboardingChecklist);
