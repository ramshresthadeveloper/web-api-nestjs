import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyModule } from '@src/company/company.module';
import { Investor, InvestorSchema } from './entities/investor.entity';
import { InvestorRepository } from './repository/investor.repository';
import { InvestorResolver } from './resolver/investor.resolver';
import { InvestorService } from './service/investor.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Investor.name, schema: InvestorSchema },
    ]),
    forwardRef(() => CompanyModule),
  ],
  providers: [InvestorRepository, InvestorService, InvestorResolver],
  exports: [InvestorRepository],
})
export class InvestorModule {}
