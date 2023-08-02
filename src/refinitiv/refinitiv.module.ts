import { Module } from '@nestjs/common';
import { RefinitivService } from './refinitiv.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { RefinitivResolver } from './refinitiv.resolver';
import { S3BucketModule } from '@src/s3-bucket/s3-bucket.module';
import { S3BucketService } from '@src/s3-bucket/s3-bucket.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Refinitiv, RefinitivSchema } from './entities/refinitiv.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Refinitiv.name,
        schema: RefinitivSchema,
      },
    ]),
    HttpModule,
    ConfigModule,
    S3BucketModule,
  ],
  providers: [RefinitivService, RefinitivResolver, S3BucketService],
  exports: [RefinitivService],
})
export class RefinitivModule {}
