import { Injectable } from '@nestjs/common';
const client = require('@mailchimp/mailchimp_marketing');
import { ConfigService } from '@nestjs/config';
import { integer } from 'aws-sdk/clients/cloudfront';
@Injectable()
export class MailchimpService {
  private listId: String;
  private journey_id: integer;
  private step_id: integer;
  private args: any;
  private mergeFields: any;
  constructor(private readonly configService: ConfigService) {
    client.setConfig({
      apiKey: this.configService.get('MAILCHIMP_API_KEY'),
      server: this.configService.get('MAILCHIMP_SERVER_PREFIX'),
    });
    this.listId = this.configService.get('MAILCHIMP_LIST_ID');
    this.journey_id = this.configService.get('MAILCHIMP_JOURNEY_ID');
    this.step_id = this.configService.get('MAILCHIMP_STEP_ID');
    this.args = {};
    this.mergeFields = {};
  }
  async addOrUpdate(User: any) {
    if (User.email) {
      this.args = {
        email_address: User.email,
        status: 'subscribed',
      };
      if (User.firstName) {
        this.mergeFields.FNAME = User.firstName;
      }
      if (User.lastName) {
        this.mergeFields.LNAME = User.lastName;
      }
      if (this.mergeFields) {
        this.args.merge_fields = this.mergeFields;
      }
      if (User.tags) {
        this.args.tags = User.tags;
      }
      const emailid = await this.findByEmail(User.email);
      if (emailid) {
        const response = await client.lists.setListMember(
          this.listId,
          emailid,
          this.args,
        );
        return await response.id;
      }
      const response = await client.lists.addListMember(this.listId, this.args);
      return await response.id;
    }
    return false;
  }
  async findByEmail(email: String) {
    let email_id = '';
    const response = await client.searchMembers.search(email);
    if (response.exact_matches.total_items) {
      email_id = response.exact_matches.members[0].id;
    }
    return email_id;
  }
  async deleteByEmail(email: String) {
    let emailid = await this.findByEmail(email);
    if (emailid) {
      const res = await client.lists.deleteListMemberPermanent(
        this.listId,
        emailid,
      );
      return await res;
    }
    return false;
  }
  async triggerCustomerJourney(email) {
    try {
      await client.customerJourneys.trigger(this.journey_id, this.step_id, {
        email_address: email,
      });
      return true;
    } catch (err) {
      return false;
    }
  }
}
