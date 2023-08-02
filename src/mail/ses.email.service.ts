import { ConfigService } from '@nestjs/config';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SESEmailService {
  constructor(private readonly configService: ConfigService) {}

  createClient() {
    const SES = new SESClient({
      credentials: {
        accessKeyId: this.configService.get('SES_KEY'),
        secretAccessKey: this.configService.get('SES_SECRET'),
      },
      region: this.configService.get('SES_REGION'),
      apiVersion: '2010-12-01',
    });

    return SES;
  }

  sendEmail = async (subject, compiledTemplate, to = [], cc = [], bcc = []) => {
    // Create sendEmail params
    const params = {
      Destination: {
        /* required */ BccAddresses: bcc,
        CcAddresses: cc,
        ToAddresses: to,
      },
      Message: {
        /* required */
        Body: {
          /* required */
          Html: {
            Charset: 'UTF-8',
            Data: compiledTemplate,
          },
          // Text: {
          //     Charset: "UTF-8",
          //     Data: message
          // }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: this.configService.get('SES_FROM') /* required */,
      ReplyToAddresses: [],
    };

    try {
      const sesClient = this.createClient();
      const data = await sesClient.send(new SendEmailCommand(params));
      // console.log('Success', data.MessageId);
      return data;
    } catch (error) {
      // console.log('Error', error);
    }
  };
}
