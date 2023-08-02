import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { CreateEmailTemplateInput } from '../dto/create-email-template.input';
import {
  EmailTemplate,
  EmailTemplateDocument,
} from '../entities/email-template.entity';

@Injectable()
export class EmailTemplateRepository {
  constructor(
    @InjectModel(EmailTemplate.name)
    private readonly emailTemplateModel: Model<EmailTemplateDocument>,
  ) {}

  async getTemplateBySlug(slug: string) {
    return await this.emailTemplateModel.findOne({ slug });
  }

  async createEmailTemplate(
    createEmailTemplateInput: CreateEmailTemplateInput,
  ) {
    const newTemplate = new this.emailTemplateModel(createEmailTemplateInput);

    return await newTemplate.save();
  }
}
