import { EnquiryService } from '@enquiry/service/enquiry.service';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
@Injectable()
export class CronjobService {
  constructor(private readonly enquiryService: EnquiryService) {}
  @Cron('00 00 * * *', {
    timeZone: 'Australia/Sydney'
  })
  async dailyTriggerCustomerJourney() {
    await this.enquiryService.triggerCustomerJourney();
  }
}
