import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

import { Model } from 'mongoose';

import {
  StripeTransaction,
  StripeTransactionDocument,
} from '@stripe-transactions/entities/stripe.transactions.entity';
import { CreateTransactionInput } from '@stripe-transactions/dto/input/create.transaction.input';
import { StripeCustomerIdInput } from '@stripe-transactions/dto/input/stripe.customer.id.input';

@Injectable()
export class StripeTransactionRepository {
  constructor(
    @InjectModel(StripeTransaction.name)
    private readonly stripeTransactionModel: Model<StripeTransactionDocument>,
  ) {}

  async createTransaction(createTransactionInput: CreateTransactionInput) {
    const newTransaction = new this.stripeTransactionModel({
      ...createTransactionInput,
    });

    return await newTransaction.save();
  }

  async getLatestTransaction({ id }: StripeCustomerIdInput) {
    return await this.stripeTransactionModel
      .findOne({ stripeCustomerId: id })
      .sort({ createdAt: -1 });
  }
}
