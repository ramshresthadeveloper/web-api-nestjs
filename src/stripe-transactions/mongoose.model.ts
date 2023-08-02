import {
  StripeTransaction,
  StripeTransactionSchema,
} from '@stripe-transactions/entities/stripe.transactions.entity';

export const mongooseModel = [
  {
    name: StripeTransaction.name,
    schema: StripeTransactionSchema,
  },
];
