import { CompanyModule } from '@company/company.module';
import { Company, CompanySchema } from '@company/entity/company.entity';
import { CompanyRepository } from '@company/repository/company.repository';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityResolver } from './activity.resolver';
import { ActivityService } from './activity.service';
import { Activity, ActivitySchema } from './entities/activity.entity';
import { ActivityRepository } from './repository/activity.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema },
      {
        name: Company.name,
        schema: CompanySchema,
      },
    ]),
    forwardRef(() => CompanyModule),
  ],
  providers: [
    ActivityRepository,
    ActivityService,
    CompanyRepository,
    ActivityResolver,
  ],
  exports: [ActivityRepository, ActivityService],
})
export class ActivityModule {}
