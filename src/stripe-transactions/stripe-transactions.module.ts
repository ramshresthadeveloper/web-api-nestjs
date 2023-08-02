import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { StripeTransactionService } from '@stripe-transactions/service/stripe.transaction.service';
import { mongooseModel } from '@stripe-transactions/mongoose.model';
import { providers } from '@stripe-transactions/providers';

@Module({
  imports: [MongooseModule.forFeature(mongooseModel)],
  providers: providers,
  exports: [StripeTransactionService],
})
export class StripeTransactionsModule {}
