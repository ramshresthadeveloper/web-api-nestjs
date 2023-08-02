import { Company, CompanySchema } from '@company/entity/company.entity';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StripeTransactionsModule } from '@src/stripe-transactions/stripe-transactions.module';
import { User, UserSchema } from '@src/user/entities/user.entity';
import { UserModule } from '@src/user/user.module';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Company.name,
        schema: CompanySchema,
      },
    ]),
    StripeTransactionsModule,
  ],
  controllers: [StripeController],
  providers: [StripeService],
})
export class StripeModule {}
