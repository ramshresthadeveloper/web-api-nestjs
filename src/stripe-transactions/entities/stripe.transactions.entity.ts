import { ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

import {ENUM}from '@src/constants/dbEnum';

export type StripeTransactionDocument = StripeTransaction & Document;

@ObjectType()
@Schema({ timestamps: true })
export class StripeTransaction {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  transactionId: string;

  @Prop({
    type: String,
    required: true,
  })
  stripeCustomerId: string;

  @Prop({
    type: String,
    enum: ENUM.transactionType,
    required: true,
  })
  type: string;

  @Prop({
    type: String,
    enum: ENUM.subscriptionPlanType,
    required: true,
  })
  planName: string;

  @Prop({ type: String })
  amount?: string;

  @Prop({ type: String })
  invoicePdfUrl?: string;
}

export const StripeTransactionSchema =
  SchemaFactory.createForClass(StripeTransaction);
