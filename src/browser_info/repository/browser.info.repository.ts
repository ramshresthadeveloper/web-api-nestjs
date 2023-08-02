import { DateTime, Duration } from 'luxon';
import { CreateBrowserInfoDto } from './../dto/create.browser.info.dto';
import {
  BrowserInfo,
  BrowserInfoDocument,
} from '../entities/browser.info.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@company/repository/base.repository';
import mongoose from 'mongoose';

@Injectable()
export class BrowserInfoRepository {
  constructor(
    @InjectModel(BrowserInfo.name)
    private browserInfoModel: Model<BrowserInfoDocument>,
  ) {}

  async create(createBrowserInfoDto: CreateBrowserInfoDto) {
    const broswerInfo = new this.browserInfoModel({
      userId: createBrowserInfoDto.userId,
      fingerprint: createBrowserInfoDto.fingerprint,
      firebaseToken: createBrowserInfoDto.firebaseToken,
      expiredAt: DateTime.now().plus({ days: 30 }).toJSDate(),
      createdAt: DateTime.now().toJSDate(),
    });
    return await broswerInfo.save();
  }

  async getFirebaseTokenByUserIds(userIds: string[], companyId: string) {
    const result = await this.browserInfoModel
      .find({
        userId: { $in: userIds },
        loggedInCompanyId: companyId,
        firebaseToken: { $nin: [null, ''] },
      })
      .select('firebaseToken')
      .lean()
      .exec();
    const tokenArray = result.map((doc: any) => doc?.firebaseToken);
    return [...new Set(tokenArray)];
  }

  async findOne(createBrowserInfoDto: CreateBrowserInfoDto) {
    const result = this.browserInfoModel
      .findOne({
        userId: createBrowserInfoDto.userId,
        fingerprint: createBrowserInfoDto.fingerprint,
      })
      .lean();
    return result.exec();
  }

  async updateFirebaseToken(
    userId: string,
    companyId: string,
    fingerprint: string,
    firebaseToken?: string,
  ) {
    const result = await this.browserInfoModel.updateOne(
      {
        userId: userId,
        fingerprint: fingerprint,
        loggedInCompanyId: companyId,
      },
      {
        firebaseToken: firebaseToken,
      },
    );
    return result;
  }

  async updateLoggedInCompanyId(
    userId: string,
    fingerprint: string,
    companyId: string,
  ) {
    const result = await this.browserInfoModel.updateOne(
      {
        userId: userId,
        fingerprint: fingerprint,
      },
      {
        loggedInCompanyId: companyId,
      },
    );
    return result;
  }

  async deleteFirebaseTokenAndCompanyId(userId: string, fingerprint: string) {
    return await this.browserInfoModel.updateOne(
      {
        userId: userId,
        fingerprint: fingerprint,
      },
      { $set: { firebaseToken: null, loggedInCompanyId: null } },
    );
  }

  async removeFirebaseTokenFromFingerprint(fingerprint: string) {
    return await this.browserInfoModel.updateMany(
      {
        fingerprint: fingerprint,
      },
      {
        $set: { firebaseToken: null, loggedInCompanyId: null },
      },
    );
  }
}
