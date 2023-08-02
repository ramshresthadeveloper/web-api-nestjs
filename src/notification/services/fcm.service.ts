import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '@src/user/entities/user.entity';
import { Model } from 'mongoose';
import * as firebaseAdmin from 'firebase-admin';
import { Investor, InvestorDocument } from '@investor/entities/investor.entity';
import { Company, CompanyDocument } from '@company/entity/company.entity';
import {
  DeviceInfo,
  DeviceInfoDocument,
} from '@notification/entities/device.info.entity';
import {
  Notification,
  NotificationDocument,
} from '@notification/entities/notification.entity';
// import serviceAccount from './firebase-service-account.json';

@Injectable()
export class FcmService {
  constructor(
    @InjectModel(Investor.name) private investorModel: Model<InvestorDocument>,
    @InjectModel(DeviceInfo.name)
    private deviceInfoModel: Model<DeviceInfoDocument>,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async investorWillingToReceiveNotification(investorId) {
    const investor = await this.investorModel.findById(investorId);

    return investor && investor.receiveNotification ? true : false;
  }

  async getDeviceTokens(investorId) {
    try {
      const deviceInfos = await this.deviceInfoModel.find({
        userId: investorId,
      });
      const deviceTokens = [];

      if (deviceInfos && deviceInfos.length > 0) {
        for (const deviceInfo of deviceInfos) {
          deviceTokens.push(deviceInfo.firebaseToken);
        }
      }

      return [...new Set(deviceTokens)];
    } catch (err) {
      console.error('Getting device tokens error: ', err);
      throw err;
    }
  }

  async sendPushNotificationToInvestor(notificationInitialPayload) {
    try {
      const {
        companyId,
        investorId,
        title,
        message,
        notificationType,
        metaData,
        legalBusinessName,
        asxCode,
        attachment,
        userObject,
      } = notificationInitialPayload;

      const willingToReceiveNotification =
        await this.investorWillingToReceiveNotification(investorId);

      if (!willingToReceiveNotification) {
        console.log(
          'Investor is not willing to receive notification or no investor found',
          investorId,
        );
        return;
      }

      let notificationPayload = {
        companyId,
        investorId,
        title,
        message,
        notificationType,
        metaData,
        legalBusinessName,
        asxCode,
        attachment,
        userObject,
      };

      const notification = await this.notificationModel.create(
        notificationPayload,
      );

      const deviceTokens = await this.getDeviceTokens(investorId);

      notificationPayload = Object.assign(
        { tokens: deviceTokens },
        notificationPayload,
      );

      await this.sendPushNotification(notificationPayload, notification._id);
    } catch (err) {
      console.error('send push notification to user err: ', err);
      throw err;
    }
  }

  sendPushNotification = async (notificationPayload, notificationId) => {
    const hasTokens = notificationPayload.tokens.length;

    if (!hasTokens) {
      console.log('No token available to send notification');
      return;
    }

    //Increase userNotification count ?

    notificationPayload.id = notificationId;

    const transformedNotificationData = await this.transformNotificationData(
      notificationPayload,
    );

    await firebaseAdmin
      .messaging()
      .sendMulticast(transformedNotificationData)
      .then(async (result) => {
        if (result.responses[0].success) {
          console.log(result.responses[0]);
          console.log(notificationPayload);
        } else {
          console.log('Error sending push notification :', result.responses[0]);
        }
      })
      .catch(async (err) => {
        console.log(
          'Error sending push notification, here is the error :',
          err,
        );
      });
  };

  async transformNotificationData(data, silent = false) {
    const payload = {
      tokens: data.tokens,
      priority: 'high',
      badge: typeof data.badge !== 'undefined' ? String(data.badge + 1) : '1',
      notification: {
        body: data.message,
        title: data.title,
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
      android: {
        notification: {
          sound: 'default',
        },
      },
      data: {
        body: data.message,
        title: data.title,
        id: String(data.id),
        sound: 'default',
        type: data.notificationType,
        eventId:
          data.metaData && data.metaData.eventId
            ? data.metaData.eventId.toString()
            : '',
        companyId:
          data.metaData && data.metaData.companyId
            ? data.metaData.companyId.toString()
            : '',
        announcementId:
          data.metaData && data.metaData.announcementId
            ? data.metaData.announcementId.toString()
            : '',
        enquiryId:
          data.metaData && data.metaData.enquiryId
            ? data.metaData.enquiryId.toString()
            : '',
        enquiryResponseId:
          data.metaData && data.metaData.enquiryResponseId
            ? data.metaData.enquiryResponseId.toString()
            : '',
        badge: typeof data.badge !== 'undefined' ? String(data.badge) : '1',
      },
    };
    if (silent) {
      delete payload.notification;
    }

    if (typeof data.notificationData !== 'undefined') {
      payload.data = { ...payload.data, ...data.notificationData };
    }

    return payload;
  }

  async sendPushNotificationToCompanyTeammembers(notificationPayload) {
    await firebaseAdmin
      .messaging()
      .sendMulticast(notificationPayload)
      .then(async (result) => {
        console.log('Success on fcm ${result.responses}');
        if (result.responses[0].success) {
          console.log(result.responses[0]);
          console.log(notificationPayload);
        } else {
          console.log('Error sending push notification :', result.responses[0]);
        }
      })
      .catch(async (err) => {
        console.log(
          'Error sending push notification, here is the error :',
          err,
        );
      });
  }
}
