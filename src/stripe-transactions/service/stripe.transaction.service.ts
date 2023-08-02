import { Injectable } from '@nestjs/common';

import { CreateTransactionInput } from '@stripe-transactions/dto/input/create.transaction.input';
import { StripeCustomerIdInput } from '@stripe-transactions/dto/input/stripe.customer.id.input';
import { StripeTransactionRepository } from '@stripe-transactions/repository/stripe.transaction.repository';

@Injectable()
export class StripeTransactionService {
  constructor(
    private readonly stripeTransactionRepository: StripeTransactionRepository,
  ) {}

  async createTransaction(createTransactionInput: CreateTransactionInput) {
    return await this.stripeTransactionRepository.createTransaction(
      createTransactionInput,
    );
  }

  async getLatestTransaction(stripeCustomerId: StripeCustomerIdInput) {
    return await this.stripeTransactionRepository.getLatestTransaction(
      stripeCustomerId,
    );
  }
}
