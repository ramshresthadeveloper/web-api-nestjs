import { Field, InputType } from '@nestjs/graphql';

import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import {ENUM}from '@src/constants/dbEnum';
import MSG from '@src/constants/validation.message';

@InputType()
export class CreateTransactionInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: MSG.PROPERTY_REQUIRED })
  transactionId: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: MSG.PROPERTY_REQUIRED })
  stripeCustomerId: string;

  @Field()
  @IsEnum(ENUM.transactionType)
  @IsNotEmpty({ message: MSG.PROPERTY_REQUIRED })
  type: string;

  @Field()
  @IsEnum(ENUM.subscriptionPlanType)
  @IsNotEmpty({ message: MSG.PROPERTY_REQUIRED })
  planName: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  amount?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  invoicePdfUrl?: string;
}
