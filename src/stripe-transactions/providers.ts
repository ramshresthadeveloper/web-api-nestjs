import { StripeTransactionRepository } from '@stripe-transactions/repository/stripe.transaction.repository';
import { StripeTransactionService } from '@stripe-transactions/service/stripe.transaction.service';

export const providers = [
  StripeTransactionRepository,
  StripeTransactionService,
];
