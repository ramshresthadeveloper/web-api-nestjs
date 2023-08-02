import { AnnouncementRepository } from '@announcement/repository/announcement.repository';
import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3BucketService } from '@s3-bucket/s3-bucket.service';
import { TimeseriesRepository } from '@src/timeseries/repository/timeseries.repository';
import axios from 'axios';
import { DateTime } from 'luxon';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class MorningStarService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly s3BucketService: S3BucketService,
    private readonly timeSeriesRepository: TimeseriesRepository,
    private readonly announcementRepository: AnnouncementRepository,
  ) {}

  private morningStarToken: string;
  private morningStarTokenExpiration: number;

  async createToken() {
    try {
      const micro_service_username = this.configService.get(
        'MORNING_STAR_MICRO_SERVICE_USERNAME',
      );
      const micro_service_password = this.configService.get(
        'MORNING_STAR_MICRO_SERVICE_PASSWORD',
      );

      const res = await lastValueFrom(
        this.httpService.post(
          'https://www.us-api.morningstar.com/token/oauth',
          {},
          {
            auth: {
              username: micro_service_username,
              password: micro_service_password,
            },
          },
        ),
      );

      this.morningStarToken = res.data.access_token;
      this.morningStarTokenExpiration = new Date().getTime() + 3300000;

      return res.data;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async companyGeneralInformation(asxCode) {
    try {
      const username = this.configService.get(
        'MORNING_STAR_WEB_SERVICE_USERNAME',
      );
      const password = this.configService.get(
        'MORNING_STAR_WEB_SERVICE_PASSWORD',
      );
      const ASXCode = asxCode.toUpperCase();

      const fieldsSelection = 'S3379,S1734,H1';

      const url = `http://mstxml.morningstar.com/index.php?username=${username}&password=${password}&instrument=146.1.${ASXCode}&fields=${fieldsSelection}&JSONShort`;

      const res = await lastValueFrom(this.httpService.post(url));

      const {
        quotes: { results },
      } = res.data;

      if (results.length < 1) {
        return {
          aboutCompany: '',
          businessName: '',
          tickerSymbol: '',
        };
      }

      const { S3379, S1734, H1 } = results[0];

      return {
        aboutCompany: S3379,
        businessName: S1734,
        tickerSymbol: H1,
      };
    } catch (err) {
      throw err;
    }
  }

  async getTimeSeriesData(asxCodes = [], startDate, endDate) {
    try {
      if (asxCodes.length < 1) {
        return;
      }
      const username = this.configService.get(
        'MORNING_STAR_WEB_SERVICE_USERNAME',
      );
      const password = this.configService.get(
        'MORNING_STAR_WEB_SERVICE_PASSWORD',
      );
      startDate = new Date(startDate)
        .toLocaleDateString('en-AU')
        .replace(/\//g, '-');
      endDate = new Date(endDate)
        .toLocaleDateString('en-AU')
        .replace(/\//g, '-');

      let instruments = '';

      asxCodes.map(
        (asx) => (instruments = instruments + `146.1.${asx.toUpperCase()},`),
      );

      const url = `http://mstxml.morningstar.com/IndexTS/?Username=${username}&password=${password}&instrument=${instruments}&sdate=${startDate}&edate=${endDate}&type=dailybar&JSONShort`;

      const res = await lastValueFrom(this.httpService.get(url));

      if (res.data?.ts) {
        return res.data?.ts?.results;
      }

      return [];
    } catch (err) {
      throw err;
    }
  }

  async getCompanyAnnouncements(asxCodes = [], startDate, endDate) {
    try {
      if (asxCodes.length < 1) {
        return;
      }

      if (
        !this.morningStarToken ||
        new Date().getTime() > this.morningStarTokenExpiration
      ) {
        await this.createToken();
      }

      const instruments = asxCodes.join(',');
      let annoucmentsList = [];

      const url = `https://www.us-api.morningstar.com/aut-comnews/announcements/feed?asxCode=${instruments}&startDate=${startDate}&endDate=${endDate}`;

      const res = await lastValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${this.morningStarToken}`,
          },
        }),
      );

      if (res.data?.metadata?.resultsTotal > 0) {
        const { pageNumber, totalPages } = res.data.metadata;
        annoucmentsList = [...res.data.results.documents];

        if (pageNumber < totalPages) {
          for (let i = pageNumber + 1; i <= totalPages; i++) {
            const res = await lastValueFrom(
              this.httpService.get(url + `&page=${i}`, {
                headers: {
                  Authorization: `Bearer ${this.morningStarToken}`,
                },
              }),
            );

            annoucmentsList = [
              ...annoucmentsList,
              ...res.data.results.documents,
            ];
          }
        }

        return annoucmentsList;
      }

      return annoucmentsList;
    } catch (err) {
      throw err;
    }
  }

  async getAnnouncementFileAndUpload(attachmentUrl) {
    try {
      if (
        !this.morningStarToken ||
        new Date().getTime() > this.morningStarTokenExpiration
      ) {
        await this.createToken();
      }
      return axios
        .get(attachmentUrl, {
          headers: {
            Authorization: `Bearer ${this.morningStarToken}`,
          },
          responseType: 'arraybuffer',
        })
        .then((response) => {
          const buffer = Buffer.from(response.data, 'base64');
          return (async () => {
            return await this.s3BucketService.uploadStreamToBucket(buffer);
          })();
        })
        .catch((err) => {
          return { type: 'error', err: err };
        });
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
  async populateMorningStarAPI(
    companyId = null,
    asxCode = null,
    userId = null,
  ) {
    if (asxCode) {
      await this.importTimeSeriesByCompanyIdOrAsx(companyId, asxCode);
      await this.importAnnouncementByCompanyIdOrAsx(companyId, asxCode, userId);
    }
  }
  async importTimeSeriesByCompanyIdOrAsx(companyId = null, asxCode) {
    let endDate = DateTime.now().minus({ days: 1 }).endOf('day').toJSDate();
    let checkTimeSeries =
      await this.timeSeriesRepository.getDataByCompanyIdOrAsx(
        companyId,
        asxCode,
      );
    let startDate = DateTime.now()
      .minus({ days: 365 })
      .startOf('day')
      .toJSDate();
    if (checkTimeSeries) {
      startDate = DateTime.now().minus({ days: 1 }).startOf('day').toJSDate();
    }
    let timeseries = await this.getTimeSeriesData(
      [asxCode],
      startDate,
      endDate,
    );
    if (timeseries && timeseries[0].data) {
      let timeseriesList = [];
      for (let i = 0; i < timeseries[0].data.length; i++) {
        let item = timeseries[0].data[i];
        timeseriesList.push({
          companyId: companyId,
          asxCode: asxCode,
          open: item.D17,
          close: item.D2,
          high: item.D18,
          low: item.D19,
          timestamp: item.D953,
        });
      }
      await this.timeSeriesRepository.insertMany(timeseriesList);
    }
  }
  async importAnnouncementByCompanyIdOrAsx(
    companyId = null,
    asxCode,
    userId = null,
  ) {
    try {
      if (userId) {
        await this.announcementRepository.updateMany(companyId, userId);
      }
      let endDate = DateTime.now()
        .minus({ days: 1 })
        .endOf('day')
        .toFormat('yyyy-MM-dd');
      let checkAnnouncements =
        await this.announcementRepository.getDataByCompanyIdOrAsx(
          companyId,
          asxCode,
        );
      let announceStartDate = DateTime.now()
        .minus({ days: 30 })
        .startOf('day')
        .toFormat('yyyy-MM-dd');
      if (checkAnnouncements) {
        announceStartDate = DateTime.now()
          .minus({ days: 1 })
          .startOf('day')
          .toFormat('yyyy-MM-dd');
      }
      const announcements = await this.getCompanyAnnouncements(
        [asxCode],
        announceStartDate,
        endDate,
      );
      if (announcements) {
        for (let i = 0; i < announcements.length; i++) {
          let imageData = null;
          const response: any = await this.getAnnouncementFileAndUpload(
            announcements[i].fullWebPath,
          );
          if (response) {
            imageData = response.Key ? response.Key : response.key;
            let publishedDate = DateTime.fromFormat(
              announcements[i].releasedDate +
                ' ' +
                announcements[i].releasedTime,
              'dd/MM/yyyy h:mma',
            ).toJSDate();
            let announcement = {
              companyId: companyId,
              userId: userId,
              asxCode: asxCode,
              title: announcements[i].header,
              attachmentSize: announcements[i].attachmentSize,
              attachmentTotalPages: announcements[i].pages,
              status: 'published',
              fromAsx: true,
              attachment: imageData,
              publishedDate: publishedDate,
            };
            await this.announcementRepository.create(announcement);
          }
        }
      }
      return true;
    } catch (err) {
      return err;
    }
  }
}
