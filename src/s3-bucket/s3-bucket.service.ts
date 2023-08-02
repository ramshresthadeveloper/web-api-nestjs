import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as mime from 'mime-types';

@Injectable()
export class S3BucketService {
  AWS_S3_BUCKET = process.env.AWS_BUCKET_NAME;
  s3 = new AWS.S3({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: 'ap-southeast-2',
  });

  async uploadStreamToBucket(stream) {
    try {
      const uniqueKey = await this.generate(12);
      const fileName = `public/announcements/${uniqueKey}.pdf`;

      const params = {
        Bucket: this.AWS_S3_BUCKET,
        Key: fileName,
        ContentType: 'application/pdf',
        ACL: 'public-read',
        ContentDisposition: 'inline',
        Body: stream,
      };

      const result = await this.s3.upload(params).promise();
      console.log('success upload', result);
      return result;
    } catch (err) {
      console.log('error upload', err);
      throw err;
    }
  }

  async uploadCsvToBucket(csvString, prefix = 'csv') {
    try {
      AWS.config.update({
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY,
          secretAccessKey: process.env.S3_SECRET_KEY,
        },
        region: 'ap-southeast-2',
      });
      const s3 = new AWS.S3();

      const body = Buffer.from(csvString);

      const uniqueKey = await this.generate(12);
      const fileName = `public/${prefix}/${uniqueKey}.csv`;

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        ContentType: 'text/csv',
        ACL: 'public-read',
        ContentDisposition: 'inline',
        Body: body,
      };

      const result = await s3.upload(params).promise();
      console.log('success upload', result);
      return result;
    } catch (err) {
      console.log('error upload', err);
      throw err;
    }
  }

  async uploadFileBuffer(buffer, mimeType, prefix, ext = null, originalfileName = null) {
    try {
      let extension = ext;

      const params: any = {
        Bucket: process.env.AWS_BUCKET_NAME,
        ACL: 'public-read',
        ContentDisposition: 'inline',
        Body: buffer,
      };

      if (!ext) {
        extension = mime.extension(mimeType) || 'jpeg';
        params.ContentType = mimeType;
      }

      let fileName = '';
      if (originalfileName != null) {
        fileName = `public/${prefix}/${originalfileName}`;
      } else {
        const uniqueKey = await this.generate(12);
        fileName = `public/${prefix}/${uniqueKey}.${extension}`;
      }

      params.Key = fileName;

      const result = await this.s3.upload(params).promise();
      console.log('success upload', result);

      return result;
    } catch (err) {
      throw err;
    }
  }

  async getSignedUrl(key) {
    try {
      const configuredkey = key;
      // Default expiration time is 900(15m)seconds
      // Add Expire: seconds in integer to change
      const params = {
        Bucket: this.AWS_S3_BUCKET,
        Key: configuredkey,
      };

      return this.s3.getSignedUrlPromise('getObject', params);
    } catch (err) {
      console.error('Getting s3 signed url error: ', err);
      throw err;
    }
  }

  async generate(count) {
    const _sym = 'abcdefghijklmnopqrstuvwxyz1234567890';
    let str = '';

    for (let i = 0; i < count; i++) {
      str += _sym[parseInt((Math.random() * _sym.length).toString())];
    }

    const time = new Date().getTime();

    return str + time;
  }
}
