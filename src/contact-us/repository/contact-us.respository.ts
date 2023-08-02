import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ContactUs, ContactUsDocument } from '../entities/contact-us.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class ContactUsRepository extends BaseRepository {
  constructor(
    @InjectModel(ContactUs.name)
    private readonly contactUsModel: Model<ContactUsDocument>,
  ) {
    super(contactUsModel);
  }

  async create(contactUsPayload): Promise<ContactUs> {
    return await this.contactUsModel.create(contactUsPayload);
  }
}
