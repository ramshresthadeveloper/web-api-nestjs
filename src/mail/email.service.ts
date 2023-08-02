import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EmailOtpRepository } from './repositories/email-otp.repository';
import { SESEmailService } from './ses.email.service';
import { DateTime } from 'luxon';
import * as uniqid from 'uniqid';
import * as fs from 'fs';
import * as Handlebars from 'hbs';
import { join } from 'path';
import { UserRepository } from 'src/user/repository/user.repository';
import Lang from '@src/constants/language';
import { User } from '@src/user/entities/user.entity';
import { TokenService } from '@src/auth/token.service';
import { TokenRepository } from '@src/auth/repository/token.repository';
import { CreateEmailTemplateInput } from './dto/create-email-template.input';
import { EmailTemplateRepository } from './repositories/email-template.repository';
import { SendEmailOtpType } from '@src/constants/dbEnum';

type sendOtpInput = {
  email: string;
  tempToken?: string;
};
interface sendOtpMailInput {
  email: string;
  fingerprint?: string;
  tempToken?: string;
}

@Injectable()
export class EmailService {
  constructor(
    private readonly sesMailService: SESEmailService,
    private readonly tokenService: TokenService,
    private readonly emailOtpRepo: EmailOtpRepository,
    private readonly userRepo: UserRepository,
    private readonly tokenRepo: TokenRepository,
    private readonly emailTemplateRepository: EmailTemplateRepository,
  ) {}

  async sendOTPMail(data: sendOtpInput, fingerprint: string, type?: string) {
    try {
      const condition: sendOtpMailInput = {
        email: data.email,
        fingerprint: fingerprint,
      };

      let emailOtp = await this.emailOtpRepo.findOne(condition);

      const user = await this.userRepo.findOne({
        email: data.email,
      });

      if (!user) {
        throw new BadRequestException(Lang.INVALID_OTP);
      }

      if (
        type != null &&
        type == SendEmailOtpType.register &&
        user.verifiedAt
      ) {
        throw new BadRequestException(Lang.USER_VERIFIED_ALREADY);
      }

      let formattedEmailOtpInfo;

      if (emailOtp) {
        if (emailOtp.email === data.email && emailOtp.expiredAt > new Date()) {
          const response = {
            message: Lang.OTP_ALREADY_SENT,
            otpExpiresAt: emailOtp.expiredAt,
          };
          return response;
        }

        formattedEmailOtpInfo = await this.formatEmailOtpInfo(
          data.email,
          emailOtp.resendCount + 1,
        );
        emailOtp = await this.emailOtpRepo.updateOne(
          condition,
          formattedEmailOtpInfo,
        );
      } else {
        formattedEmailOtpInfo = await this.formatEmailOtpInfo(data.email);
        formattedEmailOtpInfo.fingerprint = fingerprint;
        emailOtp = await this.emailOtpRepo.create(formattedEmailOtpInfo);
      }

      if (!emailOtp.otpCode) {
        throw new InternalServerErrorException('OTP not created');
      }

      const template = await this.emailTemplateRepository.getTemplateBySlug(
        'email-otp-user',
      );
      const content = this.parseContent({
        content: template.content,
        name: user.firstName,
        otpCode: formattedEmailOtpInfo.otpCode,
      });

      const compiledHtml = this.getCompiledHtml(content);

      this.sesMailService.sendEmail(template.subject, compiledHtml, [
        data.email,
      ]);

      const response = {
        message: Lang.OTP_SENT_SUCCESS,
        otpExpiresAt: formattedEmailOtpInfo.expiredAt,
      };
      return response;
    } catch (err) {
      throw err;
    }
  }

  async sendForgotPasswordMail(user: User) {
    try {
      const payload = {
        username: user.userName,
        sub: user._id,
        userType: 'companyUser',
      };
      const resetPasswordToken =
        this.tokenService.generateForgotPasswordToken(payload);

      const link =
        process.env.WEB_APP_URL + '/forgot-password/' + resetPasswordToken;

      const template = await this.emailTemplateRepository.getTemplateBySlug(
        'user-forgot-password',
      );
      const content = this.parseContent({
        content: template.content,
        name: user.firstName,
        link: link,
      });

      const compiledHtml = this.getCompiledHtml(content);

      await this.sesMailService.sendEmail(template.subject, compiledHtml, [
        user.email,
      ]);

      const userTokenInDb = await this.tokenRepo.findOne({
        userId: user._id,
        tokenType: 'user-forgot-password',
      });

      if (userTokenInDb) {
        await this.tokenRepo.updateOne(
          { userId: user._id, tokenType: 'user-forgot-password' },
          { token: resetPasswordToken },
        );
      } else {
        await this.tokenRepo.create({
          token: resetPasswordToken,
          tokenType: 'user-forgot-password',
          userId: user._id,
        });
      }

      return {
        message: Lang.FORGOT_PASSWORD_EMAIL_SEND,
      };
    } catch (err) {
      throw err;
    }
  }

  async sendPasswordChangedMail(email: string, firstName = 'diolog user') {
    try {
      const template = await this.emailTemplateRepository.getTemplateBySlug(
        'user-password-changed',
      );

      const content = this.parseContent({
        content: template.content,
        name: firstName,
        email,
      });

      const compiledHtml = this.getCompiledHtml(content);

      await this.sesMailService.sendEmail(template.subject, compiledHtml, [
        email,
      ]);
    } catch (err) {
      throw err;
    }
  }

  async sendCompanyDeletedEmail(memberData) {
    try {
      const { email, userName, legalBusinessName } = memberData;

      const template = await this.emailTemplateRepository.getTemplateBySlug(
        'company-removed',
      );

      const content = this.parseContent({
        content: template.content,
        userName,
        legalBusinessName,
      });

      const compiledHtml = this.getCompiledHtml(content);

      await this.sesMailService.sendEmail(template.subject, compiledHtml, [
        email,
      ]);
    } catch (err) {
      throw err;
    }
  }

  async sendInvitationMail(
    user: User,
    invitedUser: User,
    companyId,
    isNewUser = false,
    companyName: string,
  ) {
    try {
      let invitationLink = process.env.WEB_APP_URL;

      const payload = {
        sub: invitedUser._id,
        companyId,
      };

      const invitationToken =
        this.tokenService.generateInvitationToken(payload);

      invitationLink = process.env.WEB_APP_URL + '/register/' + invitationToken;
      const userTokenInDb = await this.tokenRepo.findOne(
        {
          userId: user._id,
          tokenType: 'invite-member',
          invitedUserId: invitedUser._id,
        },
        { _id: 1 },
      );
      // console.log('invitedUser._id = ', invitedUser._id);
      if (userTokenInDb) {
        await this.tokenRepo.updateOne(
          {
            userId: user._id,
            tokenType: 'invite-member',
            invitedUserId: invitedUser._id,
          },
          { token: invitationToken },
        );
      } else {
        await this.tokenRepo.create({
          token: invitationToken,
          tokenType: 'invite-member',
          userId: user._id,
          invitedUserId: invitedUser._id,
        });
      }

      const template = await this.emailTemplateRepository.getTemplateBySlug(
        'invite-team-member',
      );
      if (!template) {
        throw new InternalServerErrorException(
          Lang.NO_INVITATION_EMAIL_TEMPLATE,
        );
      }

      const content = this.parseContent({
        content: template.content,
        fallbackLink: invitationLink,
        invitationLink: invitationLink,
        joinOrCreate: isNewUser ? 'Create' : 'Join',
        companyName,
      });

      const compiledHtml = this.getCompiledHtml(content);

      await this.sesMailService.sendEmail(template.subject, compiledHtml, [
        invitedUser.email,
      ]);
    } catch (err) {
      throw err;
    }
  }

  getCompiledHtml(parsedContent) {
    const templateContent = fs.readFileSync(
      join(
        process.cwd(),
        process.env.TEMPLATE_DIR || '/src/templates/emailLayout.hbs',
      ),
      'utf-8',
    );

    const compiledTemplate = Handlebars.compile(templateContent);

    const compiledHtml = compiledTemplate({
      content: parsedContent,
    });
    return compiledHtml;
  }

  generateOTPCode(): number {
    //For testing adding default otp code
    return Math.floor(Math.random() * (9999 - 1111 + 1) + 1111);
  }

  parseContent(emailContent) {
    const matches = emailContent.content.match(/{{(.+?)}}/g);
    if (matches) {
      matches.forEach(function (item) {
        if (item === '{{name}}') {
          emailContent.content = emailContent.content.replace(
            '{{name}}',
            emailContent.name || '',
          );
        }
        if (item === '{{userName}}') {
          emailContent.content = emailContent.content.replace(
            '{{userName}}',
            emailContent.userName || '',
          );
        }
        if (item === '{{email}}') {
          emailContent.content = emailContent.content.replace(
            '{{email}}',
            emailContent.email || '',
          );
        }
        if (item === '{{companyName}}') {
          emailContent.content = emailContent.content.replace(
            '{{companyName}}',
            emailContent.companyName || '',
          );
        }
        if (item === '{{otpCode}}') {
          emailContent.content = emailContent.content.replace(
            '{{otpCode}}',
            emailContent.otpCode || '',
          );
        }
        if (item === '{{password}}') {
          emailContent.content = emailContent.content.replace(
            '{{password}}',
            emailContent.password || '',
          );
        }
        if (item === '{{link}}') {
          emailContent.content = emailContent.content.replace(
            '{{link}}',
            emailContent.link,
          );
        }

        if (item === '{{invitationLink}}') {
          emailContent.content = emailContent.content.replace(
            '{{invitationLink}}',
            emailContent.invitationLink,
          );
        }

        if (item === '{{fallbackLink}}') {
          emailContent.content = emailContent.content.replace(
            '{{fallbackLink}}',
            emailContent.fallbackLink,
          );
        }
        if (item.toLowerCase() === '{{join/create}}') {
          emailContent.content = emailContent.content.replace(
            '{{join/create}}',
            emailContent.joinOrCreate,
          );
        }
      });
    }
    return emailContent.content;
  }

  formatEmailOtpInfo(email, resendCount = 1) {
    const code = this.generateOTPCode();
    const expireDate = this.calculateExpiredDate(resendCount);
    const data: { [key: string]: any } = {
      email,
      otpCode: code,
      expiredAt: expireDate.toJSDate(),
      resendCount: resendCount,
      createdAt: new Date(),
    };

    return data;
  }

  calculateExpiredDate = (resendCount: number) => {
    try {
      if (resendCount === 1) {
        return DateTime.now().plus({ minutes: 2 });
      }
      return DateTime.now().plus({
        minutes: resendCount * resendCount,
      });
    } catch (err) {
      throw err;
    }
  };

  async createEmailTemplate(
    createEmailTemplateInput: CreateEmailTemplateInput,
  ) {
    const emailTemplate = await this.emailTemplateRepository.getTemplateBySlug(
      createEmailTemplateInput.slug,
    );

    if (emailTemplate) {
      throw new ConflictException(Lang.EMAIL_TEMPLATE_ALREADY_EXISTS);
    }

    return await this.emailTemplateRepository.createEmailTemplate(
      createEmailTemplateInput,
    );
  }

  async getEmailTemplate(mailSlugInput) {
    const emailTemplate = await this.emailTemplateRepository.getTemplateBySlug(
      mailSlugInput.slug,
    );

    if (!emailTemplate) {
      throw new NotFoundException(Lang.EMAIL_TEMPLATE_NOT_FOUND);
    }

    return emailTemplate;
  }
}
