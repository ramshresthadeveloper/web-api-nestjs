import { BrowserInfoRepository } from './repository/browser.info.repository';
import { Injectable } from '@nestjs/common';
import { CreateBrowserInfoDto } from './dto/create.browser.info.dto';

@Injectable()
export class BrowserInfoService {
  constructor(private readonly browserInfoRepository: BrowserInfoRepository) {}

  async getBrowserInfo(createBrowserInfoDto: CreateBrowserInfoDto) {
    return await this.browserInfoRepository.findOne(createBrowserInfoDto);
  }

  async createNewBrowserInfo(createBrowserInfoDto: CreateBrowserInfoDto) {
    return await this.browserInfoRepository.create(createBrowserInfoDto);
  }

  async getFirebaseTokenByUserIds(userIds: string[], companyId: string) {
    return await this.browserInfoRepository.getFirebaseTokenByUserIds(
      userIds,
      companyId,
    );
  }

  async updateFirebaseToken(
    userId: string,
    companyId: string,
    fingerprint: string,
    firebaseToken?: string,
  ) {
    return await this.browserInfoRepository.updateFirebaseToken(
      userId,
      companyId,
      fingerprint,
      firebaseToken,
    );
  }

  async removeFirebaseTokenFromFingerprint(fingerprint: string) {
    return await this.browserInfoRepository.removeFirebaseTokenFromFingerprint(
      fingerprint,
    );
  }

  async updateLoggedInCompanyId(
    userId: string,
    fingerprint: string,
    companyId: string,
  ) {
    return await this.browserInfoRepository.updateLoggedInCompanyId(
      userId,
      fingerprint,
      companyId,
    );
  }

  async deleteFirebaseTokenAndCompanyId(userId: string, fingerprint: string) {
    return await this.browserInfoRepository.deleteFirebaseTokenAndCompanyId(
      userId,
      fingerprint,
    );
  }
}
