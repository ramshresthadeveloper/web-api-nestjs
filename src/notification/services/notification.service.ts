import { BrowserInfoService } from './../../browser_info/browser_info.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';

import { CompanyRepository } from '@company/repository/company.repository';
import { User } from '@src/user/entities/user.entity';
import { NotificationRepository } from '../repository/notification.repository';
import { NotificationListInput } from '../dto/input/notification-list.input';
import { NotificationIdOnlyInput } from '../dto/input/notificationId.input';
import Lang from '@src/constants/language';
import { FcmService } from './fcm.service';
import { InjectModel } from '@nestjs/mongoose';
import { Investor, InvestorDocument } from '@investor/entities/investor.entity';
import { ConfigService } from '@nestjs/config';
import { CostExplorer } from 'aws-sdk';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepo: NotificationRepository,
    private readonly companyRepo: CompanyRepository,
    private readonly fcmService: FcmService,
    private readonly browserInfoService: BrowserInfoService,
    private readonly configService: ConfigService,
    @InjectModel(Investor.name) private investorModel: Model<InvestorDocument>,
  ) {}

  async checkUserIsInCompany(userId, companyId) {
    try {
      const userBelongsToCompany =
        await this.companyRepo.checkIfUserBelongsToCompany(userId, companyId);

      if (!userBelongsToCompany) {
        throw new ForbiddenException();
      }
    } catch (err) {
      throw err;
    }
  }

  async getNotifications(
    user: User,
    notificationListInput: NotificationListInput,
  ) {
    try {
      const { companyId, page, limit } = notificationListInput;
      const { _id: userId } = user;

      await this.checkUserIsInCompany(user._id, companyId);

      const stages = [
        {
          $match: {
            companyId: new mongoose.Types.ObjectId(companyId),
            userId: new mongoose.Types.ObjectId(userId),
          },
        },
        { $sort: { createdAt: -1 } },
      ];

      const [notifications, teamMemberWithJobTitle] = await Promise.all([
        await this.notificationRepo.aggregatePaginate(stages, {
          page,
          limit,
        }),
        await this.companyRepo.getCompanyTeammemberIdWithJobtitle(
          new mongoose.Types.ObjectId(companyId),
        ),
      ]);

      const isAllread = await this.notificationRepo.checkIfAllNotificationRead({
        companyId: new mongoose.Types.ObjectId(companyId),
        userId: new mongoose.Types.ObjectId(userId),
      });

      notifications['isAllread'] = isAllread;

      await this.notificationRepo.resetNotificationCounter({
        companyId: new mongoose.Types.ObjectId(companyId),
        userId: new mongoose.Types.ObjectId(userId),
      });

      // Setting the jobtitle on user object
      notifications.items.forEach((notificationData) => {
        if (notificationData.userObject) {
          if (
            notificationData.userObject._id.toString() ==
            teamMemberWithJobTitle.userId.toString()
          ) {
            notificationData.userObject.jobTitle = 'Company admin';
          } else if (teamMemberWithJobTitle.teamMembers) {
            notificationData.userObject.jobTitle = this.findTeamMemberJobTitle(
              teamMemberWithJobTitle.teamMembers,
              notificationData.userObject._id,
            );
          } else {
            notificationData.userObject.jobTitle = '';
          }
        }
      });

      return notifications;
    } catch (err) {
      throw err;
    }
  }

  private findTeamMemberJobTitle(teamMembers, userId: number) {
    let jobTitle = '';
    for (let i = 0; i < teamMembers.length; i++) {
      const teamMember = teamMembers[i];
      if (teamMember.userId.toString() === userId.toString()) {
        jobTitle = teamMember.jobTitle;
        break;
      }
    }
    return jobTitle;
  }

  async createQueryAssignedNotification(queryAssignedPayload) {
    try {
      const { assignerId, companyId, staffId, enquiriesIds, userObject } =
        queryAssignedPayload;
      if (enquiriesIds.length < 1) {
        return;
      }
      let firebaseTokens: string[] = [];
      if (assignerId != staffId) {
        firebaseTokens =
          await this.browserInfoService.getFirebaseTokenByUserIds(
            [staffId],
            companyId,
          );
      }
      let pushNotificationPayload = {};
      const webAppBaseUrl = this.configService.get('WEB_APP_URL');
      if (firebaseTokens.length > 0) {
        pushNotificationPayload = {
          notification: {
            title: 'You have been assigned a question on nestjs!',
            body: 'Respond to your investors to let them know you’re listening.',
          },
          tokens: firebaseTokens,
          webpush: {
            fcmOptions: {},
            notification: {
              icon: 'https://app.nestjs.com.au/site-icon.svg',
            },
          },
        };
      }
      enquiriesIds.map((enquiryId) => {
        this.notificationRepo.create({
          companyId,
          userId: staffId,
          title: 'Question assigned',
          message: 'You have been assigned a question',
          notificationType: 'enquiry-assigned',
          metaData: {
            enquiryId,
          },
          userObject,
        });
        if (firebaseTokens.length > 0) {
          const url = `${webAppBaseUrl}/dashboard/questions/${enquiryId}`;
          pushNotificationPayload['webpush']['fcmOptions']['link'] = url;
          try {
            this.fcmService.sendPushNotificationToCompanyTeammembers(
              pushNotificationPayload,
            );
          } catch (error) {
            console.log(
              'Error on sending push notification on question assigned',
            );
          }
        }
      });
    } catch (err) {
      throw err;
    }
  }

  async createEventAddedNotification(
    user: User,
    notificationCreateInput,
    eventCreated,
  ) {
    try {
      const { companyId, message, metaData, eventAttendies, title } =
        notificationCreateInput;
      let notificationType;
      if (eventCreated == true) {
        notificationType = 'event-created';
      } else {
        notificationType = 'event-deleted';
      }
      const userObject = {
        _id: user._id,
        userName: user.userName,
        profileImage: user.profileImage ? user.profileImage : '',
        jobTitle: user.jobTitle ? user.jobTitle : 'Company admin',
      };
      if (eventAttendies === 'admin' || eventAttendies === 'both') {
        const company =
          await this.companyRepo.companyDetailWithTeamMemberSimple(companyId);

        if (company.teamMembers && company.teamMembers.length > 0) {
          company.teamMembers.map((teamMember) => {
            if (teamMember.userId.toString() !== user._id.toString()) {
              this.notificationRepo.create({
                companyId,
                userId: teamMember.userId,
                title,
                message,
                notificationType,
                metaData,
                userObject,
              });
            }
          });
        }

        if (company.userId.toString() !== user._id.toString()) {
          this.notificationRepo.create({
            companyId,
            userId: company.userId,
            title,
            message,
            notificationType,
            metaData,
            userObject,
          });
        }
      }
      if (eventAttendies === 'investors' || eventAttendies === 'both') {
        this.sendNotificationToInvestors({
          companyId,
          title,
          message,
          notificationType,
          metaData,
          userObject,
        });
      }
    } catch (err) {
      throw err;
    }
  }

  async createAnnouncementAddedNotification(
    user: User,
    notificationCreateInput,
  ) {
    try {
      const { companyId, message, metaData, title } = notificationCreateInput;
      const notificationType = 'announcement-created';
      const company = await this.companyRepo.companyDetailWithTeamMember(
        companyId,
      );

      const userObject = {
        _id: user._id,
        userName: user.userName,
        profileImage: user.profileImage ? user.profileImage : '',
        jobTitle: user.jobTitle ? user.jobTitle : 'Company admin',
      };

      if (company.teamMembers && company.teamMembers.length > 0) {
        company.teamMembers.map((teamMember) => {
          if (teamMember.userId.toString() !== user._id.toString()) {
            this.notificationRepo.create({
              companyId,
              userId: teamMember.userId,
              title,
              message,
              notificationType,
              metaData,
              userObject,
            });
          }
        });
      }

      if (company.userId.toString() !== user._id.toString()) {
        this.notificationRepo.create({
          companyId,
          userId: company.userId,
          title,
          message,
          notificationType,
          metaData,
          userObject,
        });
      }

      this.sendNotificationToInvestors({
        companyId,
        title,
        message,
        notificationType,
        metaData,
        userObject,
      });
    } catch (err) {
      throw err;
    }
  }

  async sendNotificationToInvestors(notificationPayload) {
    try {
      const {
        companyId,
        message,
        metaData,
        title,
        notificationType,
        attachment,
        userObject,
      } = notificationPayload;

      const investors = await this.investorModel.find({
        $or: [
          { investedCompanies: { $in: [companyId] } },
          { interestedCompanies: { $in: [companyId] } },
        ],
      });

      if (investors.length < 1) {
        console.log('no investor found to send event push notification');
        return;
      }

      const companyDetails = await this.companyRepo.findOne({ _id: companyId });

      await Promise.all(
        investors.map(async (investor) => {
          await this.fcmService.sendPushNotificationToInvestor({
            asxCode: companyDetails?.asxCode,
            companyId,
            investorId: investor._id,
            legalBusinessName: companyDetails?.legalBusinessName,
            message,
            metaData,
            notificationType,
            title,
            attachment: attachment,
            userObject,
          });
        }),
      );
    } catch (err) {
      console.error('Error in sending push notification to investor', err);
      throw err;
    }
  }

  async createEnquiryRespondedNotification(
    user,
    enquirerId,
    notificationCreateInput,
  ) {
    try {
      const { companyId, message, metaData } = notificationCreateInput;
      const title = 'nestjs';
      const notificationType = 'enquiry-responded';
      const userObject = {
        _id: user._id,
        userName: user.userName,
        profileImage: user.profileImage ? user.profileImage : '',
        jobTitle: user.jobTitle ? user.jobTitle : 'Company admin',
      };
      this.fcmService.sendPushNotificationToInvestor({
        companyId,
        investorId: enquirerId,
        title,
        message,
        notificationType,
        metaData,
        userObject,
      });
    } catch (err) {
      throw err;
    }
  }

  async readNotification(notificationInput: NotificationIdOnlyInput) {
    try {
      const { notificationId } = notificationInput;
      const notification = await this.notificationRepo.makeNotificationRead(
        notificationId,
      );

      if (!notification) {
        throw new NotFoundException(Lang.NOTIFICATION_NOT_FOUND);
      }

      return {
        message: Lang.NOTIFICATION_READ_SUCCESSFULLY,
      };
    } catch (err) {
      throw err;
    }
  }

  async getUnreadNotification(userId: string, companyId: string) {
    const unreadNotification = this.notificationRepo.getUnreadNotificationCount(
      userId,
      companyId,
    );
    return { count: unreadNotification };
  }

  async markAllNotificationAsRead(_id: string, companyId: string) {
    await this.notificationRepo.setMultipleNotificationRead({
      companyId: new mongoose.Types.ObjectId(companyId),
      userId: _id,
    });
    return {
      message: Lang.NOTIFICATION_READ_SUCCESSFULLY,
    };
  }
}
