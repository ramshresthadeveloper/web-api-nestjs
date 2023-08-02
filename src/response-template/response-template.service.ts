import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';

import { CompanyRepository } from '@src/company/repository/company.repository';
import Lang from '@src/constants/language';
import { User } from '@src/user/entities/user.entity';
import { ResponseTemplateListInput } from './dto/input/response-template-list.input';
import { ResponseTemplateRepository } from './repository/response-template.repository';
import { ResponseTemplateInput } from './dto/input/response-template.input';
import { FileUpload } from 'graphql-upload';
import { S3BucketService } from '@src/s3-bucket/s3-bucket.service';
import { ResponseTemplateEditInput } from './dto/input/response-template-edit.input';
import { ResponseTemplateStarInput } from './dto/input/response-template-star-input';
import { ResponseTemplateDeleteInput } from './dto/input/response-template-delete.input';

@Injectable()
export class ResponseTemplateService {
  constructor(
    private readonly responseTemplateRepo: ResponseTemplateRepository,
    private readonly companyRepo: CompanyRepository,
    private readonly s3BucketService: S3BucketService,
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

  async canManageResponseTemplate(userId, companyId) {
    try {
      const hasAdministrativePermission =
        await this.companyRepo.hasAdministrativePermission(companyId, userId);

      if (!hasAdministrativePermission) {
        throw new ForbiddenException();
      }
    } catch (err) {
      throw err;
    }
  }

  async getResponseTemplates(
    user: User,
    responseTemplateListInput: ResponseTemplateListInput,
  ) {
    try {
      const { companyId, responseTemplateType, page, limit } =
        responseTemplateListInput;
      const { _id: userId } = user;

      await this.checkUserIsInCompany(userId, companyId);
      await this.isCompanyValidated(companyId);

      const matchPayload: any = {
        companyId: new mongoose.Types.ObjectId(companyId),
        deleted: false,
      };

      if (responseTemplateType === 'starred') {
        matchPayload.starred = true;
      }

      if (responseTemplateType === 'deleted') {
        matchPayload.deleted = true;
      }

      const stages: any = [
        {
          $match: matchPayload,
        },
        { $sort: { updatedAt: -1 } },
      ];

      const result = await this.responseTemplateRepo.aggregatePaginate(stages, {
        page,
        limit,
      });

      return result;
    } catch (err) {
      throw err;
    }
  }

  async createResponseTemplate(
    user: User,
    responseTemplateInput: ResponseTemplateInput,
  ) {
    try {
      const { title, content, attachments, companyId } = responseTemplateInput;
      const { _id: userId } = user;
      await this.checkUserIsInCompany(userId, companyId);
      await this.isCompanyValidated(companyId);
      return await this.responseTemplateRepo.create({
        title,
        content,
        attachments: attachments || [],
        companyId,
      });
    } catch (err) {
      throw err;
    }
  }

  async updateResponseTemplate(
    user: User,
    responseTemplateEditInput: ResponseTemplateEditInput,
  ) {
    try {
      const {
        title,
        content,
        attachments,
        companyId,
        responseTemplateId,
        deleted,
        starred,
      } = responseTemplateEditInput;
      const { _id: userId } = user;
      await this.checkUserIsInCompany(userId, companyId);
      await this.isCompanyValidated(companyId);

      const updatedResponseTemplate =
        await this.responseTemplateRepo.findByIdAndUpdate(responseTemplateId, {
          title,
          content,
          attachments: attachments || [],
          deleted,
          starred,
        });
      if (!updatedResponseTemplate) {
        throw new NotFoundException(Lang.RESPONSE_TEMPLATE_NOT_FOUND);
      }

      return updatedResponseTemplate;
    } catch (err) {
      throw err;
    }
  }

  async starResponseTemplate(
    user: User,
    responseTemplateStarInput: ResponseTemplateStarInput,
  ) {
    try {
      const { responseTemplateId, starred, companyId } =
        responseTemplateStarInput;
      const { _id: userId } = user;

      await this.checkUserIsInCompany(userId, companyId);
      await this.isCompanyValidated(companyId);

      const updatedResponseTemplate =
        await this.responseTemplateRepo.findByIdAndUpdate(responseTemplateId, {
          starred,
        });

      if (!updatedResponseTemplate) {
        throw new NotFoundException(Lang.RESPONSE_TEMPLATE_NOT_FOUND);
      }

      return updatedResponseTemplate;
    } catch (err) {
      throw err;
    }
  }

  async deleteResponseTemplate(
    user: User,
    responseTemplateDeleteInput: ResponseTemplateDeleteInput,
  ) {
    try {
      const { companyId, responseTemplateId } = responseTemplateDeleteInput;
      const { _id: userId } = user;

      await this.canManageResponseTemplate(userId, companyId);
      await this.isCompanyValidated(companyId);

      const responseTemplate =
        await this.responseTemplateRepo.deleteResponseTemplate(
          responseTemplateId,
        );
      if (!responseTemplate) {
        throw new NotFoundException(Lang.RESPONSE_TEMPLATE_NOT_FOUND);
      }
      return { message: Lang.RESPONSE_TEMPLATE_PERMANENT_DELETE_MESSAGE };
    } catch (err) {
      throw err;
    }
  }

  async uploadFile(file: FileUpload) {
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
        'response-template',
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

  async saveInitialDefaultResponseTemplate(companyId) {
    try {
      let templateResponseObjects = [
        {
          title: 'Non-public information',
          content: `
Hi {{name}}, 

Thank you for your question! 
To ensure we comply with public information regulations, this particular question will be answered in our next release.

Please look out for the release, you will be notified when it is published.

In the meantime, you can watch an interview with our CFO here {{link}} who explains the financial strategy for the next quarter.

Thank you, 
{{name}}
          `,
          companyId,
        },
        {
          title: 'Public information',
          content: `
Hi {{name}}, 

Thank you for your question! 

In 2022, {{companyName}} has invested {{amount}} in 
improving/focusing {{theme}}. We are aware that this is important to investors.

Our strategy and notes relevant to this area were mentioned in our most recent quarterly report on page {{pageNumber}} which you can find here {{link}}.

I hope this answers your question, if not, feel free to send another question in.

Thank you, 
{{name}}
          `,
          companyId,
        },
        {
          title: 'Unknown answer question',
          content: `
Hi {{name}}, 

Thank you for this interesting question. 

I have assigned your question to be answered by our CFO, {{name}}. Please keep an eye out for the response shortly. You will get a notification.

If there is anything else you would like to bring to our attention please let us know.

Thank you, 
{{name}}
          `,
          companyId,
        },
        {
          title: 'For a potential investor',
          content: `
Hi {{name}}, 

We appreciate your question and interest in {{companyName}}. I understand this is an important consideration for investors in 2022.  

{{answer}}. In the meantime you can access our investor pack here {{link}}.

Thank you, 
{{name}}
          `,
          companyId,
        },
        {
          title: 'For an upcoming AGM (current investors only)',
          content: `
Hi {{name}}, 

We appreciate your question and interest in {{company}}. 

This particular question will be answered in our AGM on {{date}}. As a current investor we would encourage you to attend and send in any other questions you may have. 
Our CEO, {{ceoName}} and CFO, {{cfoName}} will be present.
  
Register here: {{link}}.
  
Thank you, 
{{name}}
`,
          companyId,
        },
      ];
      return await this.responseTemplateRepo.bulkCreate(
        templateResponseObjects,
      );
    } catch (err) {
      throw err;
    }
  }
}
