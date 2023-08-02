import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EmailOtp, EmailOtpDocument } from '../entities/email-otp.entity';
import { Model } from 'mongoose';

@Injectable()
export class EmailOtpRepository {
  constructor(
    @InjectModel(EmailOtp.name) private emailOtpModel: Model<EmailOtpDocument>,
  ) {}

  async create(createEmailOtp) {
    return await this.emailOtpModel.create(createEmailOtp);
  }

  async findOne(condition) {
    return await this.emailOtpModel.findOne(condition);
  }

  async updateOne(condition, data) {
    return await this.emailOtpModel.findOneAndUpdate(condition, data, {
      new: true,
    });
  }

  async deleteOne(condition) {
    return await this.emailOtpModel.deleteOne(condition);
  }

  async latestOtp(condition) {
    return await this.emailOtpModel.findOne(condition).sort({
      createdAt: -1,
    });
  }
}
