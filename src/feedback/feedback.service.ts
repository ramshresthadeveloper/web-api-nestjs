import { ActivityService } from '@activity/activity.service';
import { CompanyRepository } from '@company/repository/company.repository';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { S3BucketService } from '@s3-bucket/s3-bucket.service';
import Lang from '@src/constants/language';
import { User } from '@src/user/entities/user.entity';
import { FileUpload } from 'graphql-upload';
import { extname } from 'path';
import { FeedBackCreateInput } from './dto/input/feedback-create.input';
import { FeedbackRepository } from './repositories/feedback.repository';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly feedbackRepository: FeedbackRepository,
    private readonly s3BucketService: S3BucketService,
    private readonly activityService: ActivityService,
    private readonly companyRepo: CompanyRepository,
  ) {}

  async checkUserIsInCompany(userId, companyId) {
    try {
      const userBelongsToCompany =
        await this.companyRepo.checkIfUserBelongsToCompany(userId, companyId);

      if (!userBelongsToCompany) {
        throw new ForbiddenException();
      }
      return userBelongsToCompany;
    } catch (err) {
      throw err;
    }
  }

  async createFeedback(user: User, feedbackInput: FeedBackCreateInput) {
    try {
      const { title, description, attachment, companyId } =
        feedbackInput;
      const { _id: userId } = user;

      const company = await this.checkUserIsInCompany(user._id, companyId);

      const feedback = await this.feedbackRepository.create({
        title,
        description,
        attachment,
        companyUserId: user._id,
        userType:'company-user'
      });

      this.activityService.createActivity({
        userId,
        companyId,
        isTeamMember: userId.toString() !== company.userId.toString(),
        activityDescription: Lang.ACTIVITY_FEEDBACK_CREATED,
        jobTitle: user.jobTitle,
      });

      return feedback;
    } catch (err) {
      throw err;
    }
  }

  async uploadFile(file: FileUpload) {
    try {
      const { createReadStream } = file;

      const extension = extname(file.filename);

      const stream = createReadStream();
      const chunks = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);

      const fileFromAws = await this.s3BucketService.uploadFileBuffer(
        buffer,
        file.mimetype,
        'feedbacks',
        extension.split('.')[1],
        file.filename
      );

      return {
        key: fileFromAws.Key,
      };
    } catch (err) {
      throw err;
    }
  }
}
