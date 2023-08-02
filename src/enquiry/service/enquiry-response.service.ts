import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FileUpload } from 'graphql-upload';

import { CompanyRepository } from '@src/company/repository/company.repository';
import Lang from '@src/constants/language';
import { S3BucketService } from '@src/s3-bucket/s3-bucket.service';
import { User } from '@src/user/entities/user.entity';
import { EnquiryResponseInput } from '../dto/input/enquiry-response.input';
import { EnquiryResponseRepository } from '../repository/enquiry-response.repository';
import { EnquiryRepository } from '../repository/enquiry.repository';
import { NotificationService } from '@notification/services/notification.service';

@Injectable()
export class EnquiryResponseService {
  constructor(
    private readonly companyRepo: CompanyRepository,
    private readonly enquiryRepo: EnquiryRepository,
    private readonly enquiryResponseRepo: EnquiryResponseRepository,
    private readonly s3BucketService: S3BucketService,
    private readonly notificationService: NotificationService,
  ) {}

  async checkUserIsInCompany(userId, companyId) {
    try {
      const company = await this.companyRepo.findOne({
        _id: companyId,
      });
      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      const userBelongsToCompany =
        await this.companyRepo.checkIfUserBelongsToCompany(userId, companyId);

      if (!userBelongsToCompany) {
        throw new ForbiddenException();
      }
    } catch (err) {
      throw err;
    }
  }

  async canManageEnquries(userId, companyId) {
    const company = await this.companyRepo.questionMgmtPermission(
      userId,
      companyId,
    );

    if (!company) {
      throw new ForbiddenException(Lang.NO_ENQUIRY_MGMT_PERMISSION);
    }

    return company;
  }

  async isCompanyValidated(companyId) {
    try {
      const validated = await this.companyRepo.isCompanyValidated(companyId);

      if (!validated) {
        throw new UnprocessableEntityException(Lang.COMPANY_NOT_VALIDATED);
      }
    } catch (err) {
      throw err;
    }
  }

  async addEnquiryResponse(
    user: User,
    enquiryResponseInput: EnquiryResponseInput,
  ) {
    try {
      const { companyId, enquiryId, title, content, attachments, status } =
        enquiryResponseInput;
      const { _id: userId } = user;

      await this.canManageEnquries(userId, companyId);
      await this.isCompanyValidated(companyId);

      const enquiryResponded = await this.enquiryResponseRepo.findOne({
        enquiryId,
      });
      const isAlreadyEnquired = await this.enquiryRepo.findById(enquiryId);
      if (
        enquiryResponded &&
        status !== 'drafted' &&
        isAlreadyEnquired?.status !== 'drafted'
      ) {
        throw new BadRequestException(Lang.ENQUIRY_RESPONDED);
      }

      const enquiry = await this.enquiryRepo.updateOne(
        { _id: enquiryId },
        {
          $set: { status: status },
        },
      );
      if (!enquiry) {
        throw new NotFoundException(Lang.ENQUIRY_NOT_FOUND);
      }
      let enquiryResponse = null;
      let respondedByObj =
        status === 'responded' ? { respondedBy: userId } : {};
      if (!enquiryResponded)
        enquiryResponse = await this.enquiryResponseRepo.createEnquiryResponse({
          enquiryId,
          title,
          content,
          ...respondedByObj,
          investorId: enquiry.investorId,
          companyId,
          attachments: attachments || [],
        });
      else
        enquiryResponse = await this.enquiryResponseRepo.updateOne(
          {
            enquiryId,
          },
          {
            enquiryId,
            title,
            content,
            ...respondedByObj,
            investorId: enquiry.investorId,
            companyId,
            attachments: attachments || [],
          },
        );

      if (enquiryResponse && status === 'responded') {
        this.notificationService.createEnquiryRespondedNotification(
          user,
          enquiry.investorId,
          {
            companyId,
            message: 'Your question has been responded to!',
            metaData: {
              enquiryResponseId: enquiryResponse._id,
              enquiryId,
            },
          },
        );
      }
      return enquiryResponse;
    } catch (err) {
      throw err;
    }
  }

  async uploadEnquiryResponseFile(file: FileUpload) {
    try {
      const { createReadStream } = file;

      const stream = createReadStream();
      const chunks = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);

      const fileFromAws = await this.s3BucketService.uploadFileBuffer(
        buffer,
        file.mimetype,
        'enquiry-response',
        null,
        file.filename,
      );

      return {
        key: fileFromAws.Key,
      };
    } catch (err) {
      throw err;
    }
  }
}
