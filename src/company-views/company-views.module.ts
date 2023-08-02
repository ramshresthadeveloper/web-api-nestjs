import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CompanyViews,
  CompanyViewsSchema,
} from './entities/company.views.entity';
import { CompanyViewsRepository } from './repository/company-views.repository';
import { CompanyViewsService } from './company-views.service';
import { CompanyModule } from '@company/company.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CompanyViews.name,
        schema: CompanyViewsSchema,
      },
    ]),

    forwardRef(() => CompanyModule),
  ],
  providers: [CompanyViewsService, CompanyViewsRepository],
  exports: [CompanyViewsService, CompanyViewsRepository],
})
export class CompanyViewsModule {}
