import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ResponseTemplate,
  ResponseTemplateSchema,
} from './entities/response-template.entity';
import { ResponseTemplateRepository } from './repository/response-template.repository';
import { ResponseTemplateService } from './response-template.service';
import { ResponseTemplateResolver } from './response-template.resolver';
import { CompanyRepository } from '@src/company/repository/company.repository';
import { Company, CompanySchema } from '@src/company/entity/company.entity';
import { S3BucketService } from '@src/s3-bucket/s3-bucket.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ResponseTemplate.name, schema: ResponseTemplateSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
  ],
  providers: [
    ResponseTemplateRepository,
    ResponseTemplateResolver,
    ResponseTemplateService,
    CompanyRepository,
    S3BucketService,
  ],
})
export class ResponseTemplateModule {}
