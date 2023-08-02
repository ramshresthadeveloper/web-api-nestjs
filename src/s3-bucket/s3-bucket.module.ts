import { Module } from '@nestjs/common';
import { S3BucketService } from './s3-bucket.service';

@Module({
  exports: [S3BucketService],
  providers: [S3BucketService],
})
export class S3BucketModule {}
