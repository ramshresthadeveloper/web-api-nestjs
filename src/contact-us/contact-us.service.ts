import { Injectable } from '@nestjs/common';
import { CreateContactUsDto } from './dto/input/create-contact-us.dto';
import { ContactUsRepository } from './repository/contact-us.respository';

@Injectable()
export class ContactUsService {
  constructor(private readonly contactUsRepo: ContactUsRepository) {}

  async createContactUs(contactUs: CreateContactUsDto, userId) {
    try {
      const { subject, message } = contactUs;

      return await this.contactUsRepo.create({
        userId,
        subject,
        message,
      });
    } catch (err) {
      throw err;
    }
  }
}
