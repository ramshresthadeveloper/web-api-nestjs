import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import * as mongoose from 'mongoose';

export type CompanyViewsDocument = CompanyViews & Document;

@Schema({ timestamps: true })
export class CompanyViews {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investor',
    required: true,
  })
  investorId: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    index: true,
    required: true,
  })
  companyId: string;
}

export const CompanyViewsSchema = SchemaFactory.createForClass(CompanyViews);
