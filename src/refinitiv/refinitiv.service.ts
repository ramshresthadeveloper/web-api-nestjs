import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import { S3BucketService } from '@src/s3-bucket/s3-bucket.service';
import { Refinitiv, RefinitivDocument } from './entities/refinitiv.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
@Injectable()
export class RefinitivService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly s3BucketService: S3BucketService,
    @InjectModel(Refinitiv.name)
    private refinitvModel: Model<RefinitivDocument>,
  ) {}

  refinitivToken: string;
  refinitivTokenExpiration: string;

  async createServiceToken() {
    try {
      const data = {
        CreateServiceToken_Request_1: {
          ApplicationID: this.configService.get('REFINITIV_APP_ID'),
          Username: this.configService.get('REFINITIV_USERNAME'),
          Password: this.configService.get('REFINITIV_PASSWORD'),
        },
      };

      if (
        this.refinitivToken &&
        this.refinitivTokenExpiration &&
        new Date(this.refinitivTokenExpiration) > new Date()
      ) {
        return {
          refinitivToken: this.refinitivToken,
          refinitivTokenExpiration: this.refinitivTokenExpiration,
        };
      }

      const res = await lastValueFrom(
        this.httpService.post(
          'https://api.rkd.refinitiv.com/api/TokenManagement/TokenManagement.svc/REST/Anonymous/TokenManagement_1/CreateServiceToken_1',
          data,
        ),
      );

      this.refinitivToken = res.data.CreateServiceToken_Response_1.Token;
      this.refinitivTokenExpiration =
        res.data.CreateServiceToken_Response_1.Expiration;

      return res.data;
    } catch (err) {
      console.log('Refinitiv create service token error', err);
      throw new InternalServerErrorException();
    }
  }

  async lookUpCompanyAndPermID(asxCode) {
    try {
      if (
        !this.refinitivTokenExpiration ||
        !this.refinitivToken ||
        new Date(this.refinitivTokenExpiration) < new Date()
      ) {
        await this.createServiceToken();
      }
      const data = {
        Search_Request_1: {
          Collection: 'SearchAll',
          Filter: `ExchangeCode eq 'ASX' and AssetType eq 'Equity' and AssetStateName eq 'Active' and OrganisationStatus eq 'Listed' and IsPrimaryRIC eq true and TickerSymbol eq '${asxCode}'`,
          ResponseProperties:
            'BusinessEntity,ExchangeCode,ExchangeCountry,CommonName,Currency,TickerSymbol,PrimaryRIC,RIC,PermID,IssuerOAPermID,IssuerCountryName,AssetType,AssetCategoryName,OrganisationStatus,ListingStatus,ListingStatusName',
          UnentitledAccess: true,
        },
      };

      const res = await lastValueFrom(
        this.httpService.post(
          'http://api.rkd.refinitiv.com/api/Search2/Search2.svc/REST/Search2_1/Search_1',
          data,
          {
            headers: {
              'X-Trkd-Auth-Token': this.refinitivToken,
              'X-Trkd-Auth-ApplicationID':
                this.configService.get('REFINITIV_APP_ID'),
            },
          },
        ),
      );
      return res.data;
    } catch (err) {
      console.log('Refinitiv company lookup error', err);
      throw new InternalServerErrorException();
    }
  }

  async companyGeneralInformation(asxCode) {
    try {
      if (
        !this.refinitivTokenExpiration ||
        new Date(this.refinitivTokenExpiration) < new Date()
      ) {
        await this.createServiceToken();
      }

      const data = {
        GetGeneralInformation_Request_1: {
          companyId: asxCode.toUpperCase() + '.AX',
          companyIdType: 'RIC',
          countryCode: 'AU',
          ShowReferenceInformation: false,
        },
      };

      const res = await lastValueFrom(
        this.httpService.post(
          'http://api.rkd.refinitiv.com/api/Fundamentals/Fundamentals.svc/REST/Fundamentals_1/GetGeneralInformation_1',
          data,
          {
            headers: {
              'X-Trkd-Auth-Token': this.refinitivToken,
              'X-Trkd-Auth-ApplicationID':
                this.configService.get('REFINITIV_APP_ID'),
            },
          },
        ),
      );

      return res.data;
    } catch (err) {
      console.log('Refinitiv getting general info error: ', err);
      throw new InternalServerErrorException();
    }
  }

  async getCompanyAnnouncement(permId) {
    try {
      if (
        !this.refinitivTokenExpiration ||
        !this.refinitivToken ||
        new Date(this.refinitivTokenExpiration) < new Date()
      ) {
        await this.createServiceToken();
      }

      const data = {
        SearchSubmissions_Request_1: {
          IDOptions: {
            OAPermIDs: {
              OAPermID: [permId],
            },
          },
          DateOptions: {
            dateRangeOption: 'dateRange',
            dateFrom: DateTime.now()
              .minus({ days: 30 })
              .startOf('day')
              .toJSDate(),
            dateTo: DateTime.now().minus({ days: 1 }).startOf('day').toJSDate(),
            dateOption: 'useReleaseDate',
          },
          ResponseOptions: {
            startRow: 0,
            rowCount: 5,
            submissionSortOrder: 'releaseDate',
            sortDirection: 'Desc',
          },
        },
      };

      const res = await lastValueFrom(
        this.httpService.post(
          'http://api.rkd.refinitiv.com/api/FilingsSearch2/FilingsSearch2.svc/REST/FilingsSearch2_1/SearchSubmissions_1',
          data,
          {
            headers: {
              'X-Trkd-Auth-Token': this.refinitivToken,
              'X-Trkd-Auth-ApplicationID':
                this.configService.get('REFINITIV_APP_ID'),
            },
          },
        ),
      );

      return res.data;
    } catch (err) {
      console.log('Refinitiv get company announcement error: ', err);
      throw new InternalServerErrorException();
    }
  }

  async getAnnouncementFileAndUpload(id) {
    try {
      if (
        !this.refinitivTokenExpiration ||
        !this.refinitivToken ||
        new Date(this.refinitivTokenExpiration) < new Date()
      ) {
        await this.createServiceToken();
      }

      const url = `http://api.rkd.refinitiv.com/api/FilingsRetrieval3/FilingsRetrieval3.svc/docs/${id}/pdf/?docIDType=DocID`;
      const cookie = `RkdAppId=${this.configService.get(
        'REFINITIV_APP_ID',
      )};RkdToken=${this.refinitivToken};`;

      const res = await lastValueFrom(
        this.httpService.get(url, {
          headers: {
            Cookie: cookie,
          },
          responseType: 'stream',
        }),
      );
      const s3data = await this.s3BucketService.uploadStreamToBucket(res.data);
      return s3data;
    } catch (err) {
      console.log('Refinitiv gettting announcement and file upload: ', err);
      throw new InternalServerErrorException();
    }
  }

  async getTimeSeriesData(symbol, interval, startTime, endTime) {
    try {
      if (
        !this.refinitivTokenExpiration ||
        !this.refinitivToken ||
        new Date(this.refinitivTokenExpiration) < new Date()
      ) {
        await this.createServiceToken();
      }

      const data = {
        GetInterdayTimeSeries_Request_5: {
          Symbol: symbol.toUpperCase() + '.AX',
          StartTime: startTime,
          EndTime: endTime,
          Interval: interval,
          Field: ['OPEN', 'HIGH', 'LOW', 'CLOSE', 'BID'],
        },
      };

      const res = await lastValueFrom(
        this.httpService.post(
          'http://api.rkd.refinitiv.com/api/TimeSeries/TimeSeries.svc/REST/TimeSeries_1/GetInterdayTimeSeries_5',
          data,
          {
            headers: {
              'X-Trkd-Auth-Token': this.refinitivToken,
              'X-Trkd-Auth-ApplicationID':
                this.configService.get('REFINITIV_APP_ID'),
            },
          },
        ),
      );

      return res.data.GetInterdayTimeSeries_Response_5
        ? res.data.GetInterdayTimeSeries_Response_5.Row
        : [];
    } catch (err) {
      console.log('Refinitiv gettting time series error: ', err);
      throw new InternalServerErrorException();
    }
  }

  async getCompanyPreviousDayAnnouncement(permId) {
    try {
      if (
        !this.refinitivTokenExpiration ||
        !this.refinitivToken ||
        new Date(this.refinitivTokenExpiration) < new Date()
      ) {
        await this.createServiceToken();
      }

      const data = {
        SearchSubmissions_Request_1: {
          IDOptions: {
            OAPermIDs: {
              OAPermID: [permId],
            },
          },
          DateOptions: {
            dateRangeOption: 'dateRange',
            dateFrom: DateTime.now()
              .minus({ days: 1 })
              .startOf('day')
              .toJSDate(),
            dateTo: DateTime.now().minus({ days: 1 }).endOf('day').toJSDate(),
            dateOption: 'useReleaseDate',
          },
          ResponseOptions: {
            submissionSortOrder: 'releaseDate',
            sortDirection: 'Desc',
          },
        },
      };

      const res = await lastValueFrom(
        this.httpService.post(
          'http://api.rkd.refinitiv.com/api/FilingsSearch2/FilingsSearch2.svc/REST/FilingsSearch2_1/SearchSubmissions_1',
          data,
          {
            headers: {
              'X-Trkd-Auth-Token': this.refinitivToken,
              'X-Trkd-Auth-ApplicationID':
                this.configService.get('REFINITIV_APP_ID'),
            },
          },
        ),
      );

      return res.data;
    } catch (err) {
      console.log('Refinitiv getting previous day announcement error', err);
      console.log('data from error:  ', err.response.data);
      console.log(
        'data from error inside:  ',
        err.response.data.Fault.Reason.Text,
      );
      throw new InternalServerErrorException();
    }
  }
}
