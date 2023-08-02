import { CompanyViewsService } from './../company-views/company-views.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import fs = require('fs');
import { AnnouncementRepository } from './repository/announcement.repository';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from '@src/company/entity/company.entity';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { InvestorRepository } from '@src/investor/repository/investor.repository';
import { AnnouncementListInput } from './dto/input/announcement-list.input';
import {
  Announcement,
  AnnouncementDocument,
} from './entities/announcement.entity';
import { EngagementInput } from './dto/input/engagement.input';
import { DateTime } from 'luxon';
import { CompanyEventService } from '@src/event/event.service';
import * as csvWriter from 'csv-writer';
import { S3BucketService } from '@src/s3-bucket/s3-bucket.service';
import { User } from '@src/user/entities/user.entity';
import { CompanyRepository } from '@src/company/repository/company.repository';
import Lang from '@src/constants/language';
import { AnnouncementInput } from './dto/input/announcement.input';
import { AnnouncementEditInput } from './dto/input/announcement-edit.input';
import { AnnouncementDeleteInput } from './dto/input/announcement-delete.input';
import { FileUpload } from 'graphql-upload';
import { NotificationService } from '@notification/services/notification.service';
import { AnnouncementStarInput } from './dto/input/announcement-star.input';
import { IdOnly } from './dto/input/id-only.input';
import { extname } from 'path';
import { ActivityService } from '@activity/activity.service';
import { MorningStarService } from '@src/morning-star/morning-star.service';
import { AnnouncementDetailInput } from './dto/input/announcemnet-detail.input';
const sharp = require('sharp');
var ffmpeg = require('fluent-ffmpeg');

@Injectable()
export class AnnouncementService {
  constructor(
    private readonly annoucementRepo: AnnouncementRepository,
    private readonly companyViewsService: CompanyViewsService,
    private readonly investorRepo: InvestorRepository,
    private readonly companyEventService: CompanyEventService,
    private readonly s3BucketService: S3BucketService,
    private readonly companyRepo: CompanyRepository,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Announcement.name)
    private announcementModel: Model<AnnouncementDocument>,
    private readonly notificationService: NotificationService,
    private readonly activityService: ActivityService,
    private readonly morningStarService: MorningStarService,
  ) {}

  async uploadAttachmentAndPrepareObject(
    announcement,
    asxCodesWithCompany,
    userId = null,
    companyId = null,
  ) {
    const uploadedFile: any =
      await this.morningStarService.getAnnouncementFileAndUpload(
        announcement.fullWebPath,
      );

    const object = {
      userId:
        userId == null
          ? asxCodesWithCompany[announcement.asxCode].userId
          : userId,
      companyId:
        companyId == null
          ? asxCodesWithCompany[announcement.asxCode].companyId
          : companyId,
      title: announcement.header,
      status: 'published',
      publishedDate: DateTime.fromFormat(
        announcement.releasedDate,
        'dd/MM/yyyy',
      ).toJSDate(),
      fromAsx: true,
      attachment: uploadedFile.Key,
      attachmentSize: announcement.attachmentSize,
      attachmentTotalPages: announcement.pages,
    };

    return object;
  }

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

  async canManageAnnoucement(userId, companyId) {
    try {
      const hasAdministrativePermission =
        await this.companyRepo.hasAdministrativePermission(companyId, userId);

      if (!hasAdministrativePermission) {
        throw new ForbiddenException();
      }
    } catch (err) {
      throw err;
    }
  }

  async isCompanyValidated(companyId) {
    try {
      const validated = await this.companyRepo.isCompanyValidated(companyId);

      if (!validated) {
        throw new UnprocessableEntityException(Lang.COMPANY_NOT_VALIDATED);
      }
    } catch (err) {
      throw err;
    }
  }

  async getCompanyAnnouncements(
    user: User,
    announcementListInput: AnnouncementListInput,
  ) {
    try {
      const { companyId, page, limit, status, deleted, starred } =
        announcementListInput;
      const company = await this.companyRepo.findOne({
        _id: companyId,
      });
      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.checkUserIsInCompany(user._id, companyId);

      const { totalInterestedInvestor, totalInvestedInvestor } =
        await this.investorRepo.getTotalInterestedAndInvestedInvestor(
          companyId,
        );
      const totalInvestors =
        totalInterestedInvestor + totalInvestedInvestor || 1;

      const matchPayload: any = {
        companyId: new mongoose.Types.ObjectId(companyId),
        deleted: false,
      };

      if (status) {
        matchPayload.status = status;
      }

      if (starred) {
        matchPayload.starred = starred;
      }

      if (deleted) {
        matchPayload.deleted = deleted;
      }

      const stages = [
        {
          $match: matchPayload,
        },
        {
          $project: {
            _id: '$_id',
            seenPercentage: {
              $multiply: [
                { $divide: [{ $size: '$announcementSeenBy' }, totalInvestors] },
                100,
              ],
            },
            userId: 1,
            companyId: 1,
            title: 1,
            attachment: 1,
            status: 1,
            publishedDate: 1,
            deleted: 1,
            fromAsx: 1,
            createdAt: 1,
            updatedAt: 1,
            announcementSeenBy: 1,
            attachmentTotalPages: 1,
            attachmentSize: 1,
            starred: 1,
            media: 1,
            totalViews: 1,
            isPinned: 1,
          },
        },
        { $sort: { isPinned: -1, publishedDate: -1 } },
      ];

      const announcements = await this.annoucementRepo.aggregatePaginate(
        stages,
        {
          page,
          limit,
        },
      );
      return announcements;
    } catch (err) {
      throw err;
    }
  }

  async getEngagementLevel(user: User, engagementInput: EngagementInput) {
    try {
      const { companyId, timeRange, dataType } = engagementInput;

      const company = await this.companyRepo.findOne({
        _id: companyId,
      });
      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.checkUserIsInCompany(user._id, companyId);
      // await this.isCompanyValidated(companyId);

      if (dataType === 'events') {
        return await this.companyEventService.getCompanyEventEngagementLevel({
          companyId,
          timeRange,
        });
      }
      if (dataType === 'company-views') {
        return await this.companyViewsService.getCompanyViewsEngagementLevel({
          companyId,
          timeRange,
        });
      }
      const totalAnnouncement = await this.announcementModel
        .find({
          companyId,
          status: 'published',
          deleted: false,
        })
        .count();
      const { totalInterestedInvestor, totalInvestedInvestor } =
        await this.investorRepo.getTotalInterestedAndInvestedInvestor(
          companyId,
        );
      const totalInvestors =
        totalInterestedInvestor + totalInvestedInvestor || 1;

      const totalExpectedViews = totalAnnouncement * totalInvestors;

      let payloadToReturn;

      /************** Weekly engagement in month *********/

      if (timeRange === 'Month') {
        const lastMonthStart = DateTime.now()
          .minus({ days: 30 })
          .startOf('day')
          .toJSDate();

        const weeklyAnnouncement = await this.announcementModel.aggregate([
          {
            $match: {
              companyId: new mongoose.Types.ObjectId(companyId),
              deleted: false,
              status: 'published',
            },
          },
          {
            $unwind: {
              path: '$announcementSeenBy',
            },
          },
          { $match: { 'announcementSeenBy.seenAt': { $gte: lastMonthStart } } },
          {
            $project: {
              seenWeeks: {
                $isoWeek: '$announcementSeenBy.seenAt',
              },
              announcementId: '$_id',
              seenBy: '$announcementSeenBy.investorId',
              companyId: 1,
            },
          },
          {
            $group: {
              _id: {
                seenWeeks: '$seenWeeks',
              },
              totalSeen: {
                $sum: { $cond: [{ $ne: ['$seenWeeks', ''] }, 1, 0] },
              },
              announcementId: { $first: '$announcementId' },
              companyId: { $first: '$companyId' },
              seenBy: { $first: '$seenBy' },
              seenWeeks: { $first: '$seenWeeks' },
            },
          },
          { $sort: { seenWeeks: 1 } },
          {
            $project: {
              announcementId: 1,
              companyId: 1,
              seenBy: 1,
              totalSeen: 1,
              seenPercentage: {
                $multiply: [
                  { $divide: ['$totalSeen', totalExpectedViews] },
                  100,
                ],
              },
              seenWeeks: 1,
            },
          },
        ]);

        const engagementLevelOfPastMonthsInWeek = [];

        for (let i = 4; i >= 0; i--) {
          const weekNumber = DateTime.now().weekNumber - i;
          const matchedAnnouncement = weeklyAnnouncement.find(
            (announcement) => announcement.seenWeeks === weekNumber,
          );
          const week = `Week${weekNumber}`;

          engagementLevelOfPastMonthsInWeek.push(
            matchedAnnouncement
              ? {
                  totalSeen: matchedAnnouncement.totalSeen,
                  seenPercentage: matchedAnnouncement.seenPercentage,
                  date: week,
                }
              : {
                  totalSeen: 0,
                  seenPercentage: 0,
                  date: week,
                },
          );
        }
        const changeInEngagementLevel4Week =
          totalExpectedViews > 0
            ? ((engagementLevelOfPastMonthsInWeek[4].totalSeen -
                engagementLevelOfPastMonthsInWeek[0].totalSeen) /
                totalExpectedViews) *
              100
            : 0;

        payloadToReturn = {
          data: engagementLevelOfPastMonthsInWeek.slice(1, 5),
          changeInEngagementLevel: changeInEngagementLevel4Week,
        };

        return payloadToReturn;
      }

      /************** 7 Days engagement *********/

      if (timeRange === '7Days') {
        const pastSeventhDay = DateTime.now()
          .minus({ days: 6 })
          .startOf('day')
          .toJSDate();

        const dailyAnnouncements = await this.announcementModel.aggregate([
          {
            $match: {
              companyId: new mongoose.Types.ObjectId(companyId),
              deleted: false,
              status: 'published',
            },
          },
          {
            $unwind: {
              path: '$announcementSeenBy',
            },
          },
          { $match: { 'announcementSeenBy.seenAt': { $gte: pastSeventhDay } } },
          {
            $project: {
              seenDay: {
                $dayOfWeek: '$announcementSeenBy.seenAt',
              },
              announcementId: '$_id',
              seenBy: '$announcementSeenBy.investorId',
              companyId: 1,
              year: {
                $year: '$announcementSeenBy.seenAt',
              },
              month: { $month: '$announcementSeenBy.seenAt' },
              day: { $dayOfMonth: '$announcementSeenBy.seenAt' },
            },
          },
          {
            $group: {
              _id: {
                seenDay: '$seenDay',
              },
              totalSeen: {
                $sum: { $cond: [{ $ne: ['$seenDay', ''] }, 1, 0] },
              },
              announcementId: { $first: '$announcementId' },
              companyId: { $first: '$companyId' },
              seenBy: { $first: '$seenBy' },
              seenDay: { $first: '$seenDay' },
              year: { $first: '$year' },
              month: { $first: '$month' },
              day: { $first: '$day' },
            },
          },
          {
            $project: {
              announcementId: 1,
              companyId: 1,
              seenBy: 1,
              totalSeen: 1,
              seenPercentage: {
                $multiply: [
                  { $divide: ['$totalSeen', totalExpectedViews] },
                  100,
                ],
              },
              seenDay: 1,
              year: 1,
              month: 1,
              day: 1,
            },
          },
        ]);

        const dayArray = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const engagementLevelOfPastSevenDays = [];

        const startDay = DateTime.now()
          .minus({ days: 7 })
          .startOf('day').weekday;

        for (let i = 0; i < 7; i++) {
          const dayIndex = (startDay + 1 + i) % 7;
          const day = dayArray[dayIndex];

          const matchedAnnouncement = dailyAnnouncements.find(
            (announcement) => announcement.seenDay - 1 === dayIndex,
          );
          engagementLevelOfPastSevenDays.push(
            matchedAnnouncement
              ? {
                  totalSeen: matchedAnnouncement.totalSeen,
                  seenPercentage: matchedAnnouncement.seenPercentage,
                  date: day,
                }
              : {
                  totalSeen: 0,
                  seenPercentage: 0,
                  date: day,
                },
          );
        }

        const previousWeekTodayStart = DateTime.now()
          .minus({ days: 7 })
          .startOf('day')
          .toJSDate();
        const previousWeekTodayEnd = DateTime.now()
          .minus({ days: 7 })
          .endOf('day')
          .toJSDate();

        const previousWeekDailyAnnouncement =
          await this.announcementModel.aggregate([
            {
              $match: {
                companyId: new mongoose.Types.ObjectId(companyId),
                deleted: false,
                status: 'published',
              },
            },
            {
              $unwind: {
                path: '$announcementSeenBy',
              },
            },
            {
              $match: {
                'announcementSeenBy.seenAt': {
                  $gte: previousWeekTodayStart,
                  $lte: previousWeekTodayEnd,
                },
              },
            },
            {
              $project: {
                seenDay: {
                  $dayOfWeek: '$announcementSeenBy.seenAt',
                },
                announcementId: '$_id',
                seenBy: '$announcementSeenBy.investorId',
                companyId: 1,
                year: {
                  $year: '$announcementSeenBy.seenAt',
                },
                month: { $month: '$announcementSeenBy.seenAt' },
                day: { $dayOfMonth: '$announcementSeenBy.seenAt' },
              },
            },
            {
              $group: {
                _id: {
                  seenDay: '$seenDay',
                },
                totalSeen: {
                  $sum: { $cond: [{ $ne: ['$seenDay', ''] }, 1, 0] },
                },
                announcementId: { $first: '$announcementId' },
                companyId: { $first: '$companyId' },
                seenBy: { $first: '$seenBy' },
                seenDay: { $first: '$seenDay' },
                year: { $first: '$year' },
                month: { $first: '$month' },
                day: { $first: '$day' },
              },
            },
            {
              $project: {
                announcementId: 1,
                companyId: 1,
                seenBy: 1,
                totalSeen: 1,
                seenPercentage: {
                  $multiply: [
                    { $divide: ['$totalSeen', totalExpectedViews] },
                    100,
                  ],
                },
                seenDay: 1,
                year: 1,
                month: 1,
                day: 1,
              },
            },
          ]);

        const totalSeenInPreviousWeekDay = previousWeekDailyAnnouncement[0]
          ? previousWeekDailyAnnouncement[0].totalSeen
          : 0;

        const changeInEngagementLevel4Day =
          totalExpectedViews > 0
            ? ((engagementLevelOfPastSevenDays[6].totalSeen -
                totalSeenInPreviousWeekDay) /
                totalExpectedViews) *
              100
            : 0;

        payloadToReturn = {
          data: engagementLevelOfPastSevenDays,
          changeInEngagementLevel: changeInEngagementLevel4Day,
        };

        return payloadToReturn;
      }

      /**************Default 6 month engagement *********/
      const startMonth = DateTime.now()
        .minus({
          months: 6,
        })
        .startOf('day').month;

      const startMonthDate = DateTime.now()
        .minus({
          months: 6,
        })
        .startOf('day')
        .toJSDate();

      const announcements = await this.announcementModel.aggregate([
        {
          $match: {
            companyId: new mongoose.Types.ObjectId(companyId),
            deleted: false,
            status: 'published',
          },
        },
        {
          $unwind: {
            path: '$announcementSeenBy',
          },
        },
        { $match: { 'announcementSeenBy.seenAt': { $gte: startMonthDate } } },
        {
          $project: {
            seenDates: {
              $month: '$announcementSeenBy.seenAt',
            },
            announcementId: '$_id',
            seenBy: '$announcementSeenBy.investorId',
            companyId: 1,
          },
        },
        {
          $group: {
            _id: {
              seenDates: '$seenDates',
            },
            totalSeen: {
              $sum: { $cond: [{ $ne: ['$seenDates', ''] }, 1, 0] },
            },
            announcementId: { $first: '$announcementId' },
            companyId: { $first: '$companyId' },
            seenBy: { $first: '$seenBy' },
            seenDates: { $first: '$seenDates' },
          },
        },
        { $sort: { seenDates: 1 } },
        {
          $project: {
            announcementId: 1,
            companyId: 1,
            seenBy: 1,
            totalSeen: 1,
            seenPercentage: {
              $multiply: [{ $divide: ['$totalSeen', totalExpectedViews] }, 100],
            },
            seenDates: 1,
          },
        },
      ]);

      const monthArray = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];

      const engaementLevelOfPastSixMonths: any = [];
      for (let i = 0; i < 7; i++) {
        const monthIndex = (Number(startMonth) - 1 + i) % 12;
        const month = monthArray[monthIndex];
        const matchedAnnouncement = announcements.find(
          (announcement) => announcement.seenDates - 1 === monthIndex,
        );
        engaementLevelOfPastSixMonths.push(
          matchedAnnouncement
            ? {
                totalSeen: matchedAnnouncement.totalSeen,
                seenPercentage: matchedAnnouncement.seenPercentage,
                date: month,
              }
            : {
                totalSeen: 0,
                seenPercentage: 0,
                date: month,
              },
        );
      }

      const changeInEngagementLevel =
        totalExpectedViews > 0
          ? ((engaementLevelOfPastSixMonths[6].totalSeen -
              engaementLevelOfPastSixMonths[0].totalSeen) /
              totalExpectedViews) *
            100
          : 0;

      payloadToReturn = {
        data: engaementLevelOfPastSixMonths.slice(1, 7),
        changeInEngagementLevel,
      };

      return payloadToReturn;
    } catch (err) {
      throw err;
    }
  }

  async getEngagementLevelCsv(user: User, engagementInput: EngagementInput) {
    try {
      const { companyId, timeRange, dataType } = engagementInput;

      const company = await this.companyRepo.findOne({
        _id: companyId,
      });
      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.checkUserIsInCompany(user._id, companyId);
      await this.isCompanyValidated(companyId);

      if (dataType === 'events') {
        return await this.companyEventService.getCompanyEventEngagementLevelCsv(
          {
            companyId,
            timeRange,
          },
        );
      }

      const { totalInterestedInvestor, totalInvestedInvestor } =
        await this.investorRepo.getTotalInterestedAndInvestedInvestor(
          companyId,
        );
      const totalInvestors =
        totalInterestedInvestor + totalInvestedInvestor || 1;

      const dataForHeader = [{ id: 'postTitle', title: 'Post Title' }];

      let dataForCsv;

      /************** 7 Days engagement *********/

      if (timeRange === '7Days') {
        const pastSeventhDay = DateTime.now()
          .minus({ days: 6 })
          .startOf('day')
          .toJSDate();

        const dailyAnnouncements = await this.announcementModel.aggregate([
          {
            $match: {
              companyId: new mongoose.Types.ObjectId(companyId),
              deleted: false,
              status: 'published',
            },
          },
          {
            $unwind: {
              path: '$announcementSeenBy',
            },
          },
          { $match: { 'announcementSeenBy.seenAt': { $gte: pastSeventhDay } } },
          {
            $project: {
              seenDay: {
                $dayOfWeek: '$announcementSeenBy.seenAt',
              },
              seenBy: '$announcementSeenBy.investorId',
              _id: 1,
              userId: 1,
              companyId: 1,
              title: 1,
              status: 1,
              deleted: 1,
              fromAsx: 1,
              announcementSeenBy: 1,
              createdAt: 1,
            },
          },
          {
            $group: {
              _id: {
                seenDay: '$seenDay',
                announcementId: '$_id',
              },
              totalSeen: {
                $sum: { $cond: [{ $ne: ['$seenDay', ''] }, 1, 0] },
              },
              announcementId: { $first: '$_id' },
              companyId: { $first: '$companyId' },
              seenBy: { $first: '$seenBy' },
              seenDay: { $first: '$seenDay' },
              title: { $first: '$title' },
            },
          },
          {
            $project: {
              announcementId: 1,
              companyId: 1,
              seenBy: 1,
              totalSeen: 1,
              seenPercentage: {
                $multiply: [{ $divide: ['$totalSeen', totalInvestors] }, 100],
              },
              seenDay: 1,
              title: 1,
            },
          },
        ]);

        const dayArray = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const startDay = DateTime.now()
          .minus({ days: 7 })
          .startOf('day').weekday;

        const dataForCsvWithDup = dailyAnnouncements.map(
          (announcement, index) => {
            const announcementDataForCsv: any = {};

            for (let i = 0; i < 7; i++) {
              const dayIndex = (startDay + 1 + i) % 7;
              const day = dayArray[dayIndex];

              const matchedAnnouncement =
                announcement.seenDay - 1 === dayIndex ? announcement : null;

              if (index === 0) {
                dataForHeader.push({
                  id: day,
                  title: day,
                });
              }

              if (i === 0) {
                announcementDataForCsv.postTitle = announcement.title;
                announcementDataForCsv._id = announcement.announcementId;
              }
              announcementDataForCsv[day] = matchedAnnouncement
                ? announcement.seenPercentage
                : 0;
            }
            return announcementDataForCsv;
          },
        );

        const dataForCsvWithOutDup = dataForCsvWithDup.reduce((a, c) => {
          const x = a.find((e) => {
            return e._id.toString() === c._id.toString();
          });

          if (!x) a.push(Object.assign({}, c));
          else {
            for (const key in x) {
              if (key !== 'postTitle') {
                x[key] += c[key];
              }
            }
          }
          return a;
        }, []);

        dataForCsv = dataForCsvWithOutDup.map((data) => {
          delete data._id;
          return data;
        });
      }

      /************** Weekly engagement in month for csv *********/

      if (timeRange === 'Month') {
        const lastMonthStart = DateTime.now()
          .minus({ days: 30 })
          .startOf('day')
          .toJSDate();

        const weeklyAnnouncement = await this.announcementModel.aggregate([
          {
            $match: {
              companyId: new mongoose.Types.ObjectId(companyId),
              deleted: false,
              status: 'published',
            },
          },
          {
            $unwind: {
              path: '$announcementSeenBy',
            },
          },
          { $match: { 'announcementSeenBy.seenAt': { $gte: lastMonthStart } } },
          {
            $project: {
              seenWeeks: {
                $isoWeek: '$announcementSeenBy.seenAt',
              },
              _id: 1,
              userId: 1,
              companyId: 1,
              title: 1,
              status: 1,
              deleted: 1,
              fromAsx: 1,
              announcementSeenBy: 1,
              createdAt: 1,
            },
          },
          {
            $group: {
              _id: {
                announcementId: '$_id',
                seenWeeks: '$seenWeeks',
              },
              totalSeen: {
                $sum: { $cond: [{ $ne: ['$seenWeeks', ''] }, 1, 0] },
              },
              announcementId: { $first: '$_id' },
              companyId: { $first: '$companyId' },
              seenBy: { $first: '$seenBy' },
              seenWeeks: { $first: '$seenWeeks' },
              title: { $first: '$title' },
            },
          },
          { $sort: { seenWeeks: 1 } },
          {
            $project: {
              announcementId: 1,
              companyId: 1,
              seenBy: 1,
              totalSeen: 1,
              seenPercentage: {
                $multiply: [
                  { $divide: ['$totalSeen', totalInterestedInvestor] },
                  100,
                ],
              },
              seenWeeks: 1,
              title: 1,
            },
          },
        ]);

        const dataForCsvWithDup = weeklyAnnouncement.map(
          (announcement, index) => {
            const announcementDataForCsv: any = {};
            for (let i = 3; i >= 0; i--) {
              const weekNumber = DateTime.now().weekNumber - i;

              const matchedAnnouncement =
                announcement.seenWeeks === weekNumber ? announcement : null;

              const week = `week${weekNumber}`;

              if (index === 0) {
                dataForHeader.push({
                  id: week,
                  title: week,
                });
              }

              if (i === 3) {
                announcementDataForCsv.postTitle = announcement.title;
                announcementDataForCsv._id = announcement.announcementId;
              }
              announcementDataForCsv[week] = matchedAnnouncement
                ? announcement.seenPercentage
                : 0;
            }
            return announcementDataForCsv;
          },
        );

        const dataForCsvWithOutDup = dataForCsvWithDup.reduce((a, c) => {
          const x = a.find((e) => {
            return e._id.toString() === c._id.toString();
          });

          if (!x) a.push(Object.assign({}, c));
          else {
            for (const key in x) {
              if (key !== 'postTitle') {
                x[key] += c[key];
              }
            }
          }
          return a;
        }, []);

        dataForCsv = dataForCsvWithOutDup.map((data) => {
          delete data._id;
          return data;
        });
      }

      /*********Default 6 month engagement data for csv */

      if (timeRange === '6Months') {
        const startMonth = DateTime.now()
          .minus({
            months: 5,
          })
          .startOf('day').month;

        const startMonthDate = DateTime.now()
          .minus({
            months: 5,
          })
          .startOf('day')
          .toJSDate();

        const announcements = await this.announcementModel.aggregate([
          {
            $match: {
              companyId: new mongoose.Types.ObjectId(companyId),
              deleted: false,
              status: 'published',
            },
          },
          {
            $unwind: {
              path: '$announcementSeenBy',
            },
          },
          { $match: { 'announcementSeenBy.seenAt': { $gte: startMonthDate } } },
          {
            $project: {
              seenDates: {
                $month: '$announcementSeenBy.seenAt',
              },
              _id: 1,
              userId: 1,
              companyId: 1,
              title: 1,
              status: 1,
              deleted: 1,
              fromAsx: 1,
              announcementSeenBy: 1,
              createdAt: 1,
            },
          },
          {
            $group: {
              _id: {
                announcementId: '$_id',
                seenDates: '$seenDates',
              },
              totalSeen: {
                $sum: { $cond: [{ $ne: ['$seenDates', ''] }, 1, 0] },
              },
              announcementId: { $first: '$_id' },
              companyId: { $first: '$companyId' },
              seenBy: { $first: '$seenBy' },
              seenDates: { $first: '$seenDates' },
              title: { $first: '$title' },
            },
          },
          { $sort: { seenDates: 1 } },
          {
            $project: {
              announcementId: 1,
              companyId: 1,
              seenBy: 1,
              totalSeen: 1,
              seenPercentage: {
                $multiply: [{ $divide: ['$totalSeen', totalInvestors] }, 100],
              },
              seenDates: 1,
              title: 1,
            },
          },
        ]);

        const monthArray = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];

        const dataForCsvWithDup = announcements.map((announcement, index) => {
          const announcementDataForCsv: any = {};
          for (let i = 0; i < 6; i++) {
            const monthIndex = (Number(startMonth) - 1 + i) % 12;
            const month = monthArray[monthIndex];

            const matchedAnnouncement =
              announcement.seenDates - 1 === monthIndex ? announcement : null;
            if (index === 0) {
              dataForHeader.push({
                id: month,
                title: month,
              });
            }
            if (i === 0) {
              announcementDataForCsv.postTitle = announcement.title;
              announcementDataForCsv._id = announcement.announcementId;
            }
            announcementDataForCsv[month] = matchedAnnouncement
              ? announcement.seenPercentage
              : 0;
          }
          return announcementDataForCsv;
        });

        const dataForCsvWithOutDup = dataForCsvWithDup.reduce((a, c) => {
          const x = a.find((e) => {
            return e._id.toString() === c._id.toString();
          });

          if (!x) a.push(Object.assign({}, c));
          else {
            for (const key in x) {
              if (key !== 'postTitle') {
                x[key] += c[key];
              }
            }
          }
          return a;
        }, []);

        dataForCsv = dataForCsvWithOutDup.map((data) => {
          delete data._id;
          return data;
        });
      }

      const csvStringifier = csvWriter.createObjectCsvStringifier({
        header: dataForHeader,
      });

      const csvString =
        csvStringifier.getHeaderString() +
        csvStringifier.stringifyRecords(dataForCsv);

      const csvFileUrl = await this.s3BucketService.uploadCsvToBucket(
        csvString,
        'csv/announcements',
      );

      return {
        message: csvFileUrl.Key,
      };
    } catch (err) {
      throw err;
    }
  }

  async createAnnouncement(user: User, announcementInput: AnnouncementInput) {
    try {
      const {
        companyId,
        title,
        attachment,
        attachmentThumbnail,
        attachmentDuration,
        status,
        attachmentSize,
        attachmentTotalPages,
        media,
      } = announcementInput;
      const { _id: userId } = user;

      const company = await this.companyRepo.findOne({
        _id: companyId,
      });

      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.canManageAnnoucement(user._id, companyId);
      await this.isCompanyValidated(companyId);

      let publishedDate;

      if (status === 'published') {
        publishedDate = new Date();
      }

      const newAnnouncement = await this.annoucementRepo.create({
        userId,
        companyId,
        title,
        attachment,
        status,
        publishedDate,
        attachmentThumbnail,
        attachmentDuration,
        fromAsx: false,
        attachmentSize,
        attachmentTotalPages: attachmentTotalPages || null,
        media,
      });

      const userObject = {
        _id: user._id,
        userName: user.userName,
        profileImage: user.profileImage ? user.profileImage : '',
        jobTitle: user.jobTitle ? user.jobTitle : 'Company admin',
      };

      if (status === 'published') {
        this.notificationService.sendNotificationToInvestors({
          companyId,
          message: `${company.legalBusinessName} just created an announcement.`,
          attachment,
          metaData: {
            announcementId: newAnnouncement._id,
            companyId,
            senderId: user._id,
          },
          title: 'Announcement Created',
          notificationType: media ? 'media-created' : 'announcement-created',
          userObject,
        });

        this.activityService.createActivity({
          userId,
          companyId,
          isTeamMember: userId.toString() !== company.userId.toString(),
          activityDescription: Lang.ACTIVITY_ANNOUNCEMENT_PUBLISHED,
          jobTitle: user.jobTitle,
        });
      }

      return newAnnouncement;
    } catch (err) {
      throw err;
    }
  }

  async updateAnnouncement(
    user: User,
    announcementInput: AnnouncementEditInput,
  ) {
    try {
      const {
        companyId,
        title,
        attachment,
        status,
        announcementId,
        attachmentSize,
        attachmentTotalPages,
        media,
      } = announcementInput;
      const { _id: userId } = user;

      const company = await this.companyRepo.findOne({
        _id: companyId,
      });
      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.canManageAnnoucement(user._id, companyId);
      await this.isCompanyValidated(companyId);

      const announcement = await this.annoucementRepo.findById(announcementId);

      if (!announcement) {
        throw new NotFoundException(Lang.ANNOUNCEMENT_NOT_FOUND);
      }

      if (announcement.fromAsx) {
        throw new UnprocessableEntityException(
          Lang.ANNOUNCEMENT_FROM_ASX_UNEDITABLE,
        );
      }

      let publishedDate = announcement.publishedDate;

      if (status === 'published' && !announcement.publishedDate) {
        publishedDate = new Date();
        this.activityService.createActivity({
          userId,
          companyId,
          isTeamMember: userId.toString() !== company.userId.toString(),
          activityDescription: Lang.ACTIVITY_ANNOUNCEMENT_PUBLISHED,
          jobTitle: user.jobTitle,
        });
      }

      if (status === 'draft') {
        publishedDate = null;
      }

      const updatedAnnouncement = await this.annoucementRepo.findOneAndUpdate(
        {
          _id: announcementId,
        },
        {
          userId,
          companyId,
          title,
          attachment,
          status,
          publishedDate,
          attachmentSize,
          attachmentTotalPages: attachmentTotalPages || null,
          media,
        },
      );

      if (updatedAnnouncement && updatedAnnouncement.status === 'published') {
        this.notificationService.createAnnouncementAddedNotification(user, {
          companyId,
          title: 'Announcement updated',
          message: `${user.userName} just updated an announcement.`,
          metaData: {
            companyId,
            announcementId: updatedAnnouncement._id,
            senderId: user._id,
          },
        });
      }

      return updatedAnnouncement;
    } catch (err) {
      throw err;
    }
  }

  async deleteAnnouncement(
    user: User,
    announcementInput: AnnouncementDeleteInput,
  ) {
    try {
      const { companyId, announcementId } = announcementInput;
      const { _id: userId } = user;

      const company = await this.companyRepo.findOne({
        _id: companyId,
      });
      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.canManageAnnoucement(userId, companyId);
      await this.isCompanyValidated(companyId);

      const announcement = await this.annoucementRepo.findById(announcementId);

      if (!announcement) {
        throw new NotFoundException(Lang.ANNOUNCEMENT_NOT_FOUND);
      }

      await announcement.remove();

      if (company && !company.isAnnouncementConnected) {
        await this.companyModel.updateOne(
          { _id: companyId },
          { isAnnouncementConnected: true },
        );
      }

      this.activityService.createActivity({
        userId,
        companyId,
        isTeamMember: userId.toString() !== company.userId.toString(),
        activityDescription: Lang.ACTIVITY_ANNOUNCEMENT_DELETED,
        jobTitle: user.jobTitle,
      });

      return announcement;
    } catch (err) {
      throw err;
    }
  }

  async softDeleteAnnouncement(
    user: User,
    announcementInput: AnnouncementDeleteInput,
  ) {
    try {
      const { companyId, announcementId } = announcementInput;
      const { _id: userId } = user;

      const company = await this.companyRepo.findOne({
        _id: companyId,
      });
      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.canManageAnnoucement(userId, companyId);
      await this.isCompanyValidated(companyId);

      const announcement = await this.annoucementRepo.findById(announcementId);

      if (!announcement) {
        throw new NotFoundException(Lang.ANNOUNCEMENT_NOT_FOUND);
      }

      announcement.deleted = !announcement.deleted;
      await announcement.save();

      this.activityService.createActivity({
        userId,
        companyId,
        isTeamMember: userId.toString() !== company.userId.toString(),
        activityDescription: Lang.ACTIVITY_ANNOUNCEMENT_DELETED,
        jobTitle: user.jobTitle,
      });

      return announcement;
    } catch (err) {
      throw err;
    }
  }

  async uploadFileThumbnail() {
    const fileContent = fs.readFileSync(
      'uploads/thumbnails/thumbnail-temp.png',
    );
    const fileFromAws = await this.s3BucketService.uploadFileBuffer(
      fileContent,
      'image/png',
      'announcements',
      'png',
    );
    fs.unlinkSync('uploads/thumbnails/thumbnail-temp.png');
    return fileFromAws.Key;
  }

  async uploadFile(file) {
    try {
      const { createReadStream } = file;

      const extension = extname(file.filename);

      const stream = createReadStream();
      const chunks = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);

      const fileFromAws = await this.s3BucketService.uploadFileBuffer(
        buffer,
        file.mimetype,
        'announcements',
        extension.split('.')[1],
        file.filename,
      );
      if (
        extension.split('.')[1] === 'mp4' ||
        extension.split('.')[1] === 'mp3'
      ) {
        let filePath = '';
        let attachmentDuration = '';
        if (extension.split('.')[1] === 'mp3') {
          return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(fileFromAws.Location, function (err, metadata) {
              attachmentDuration = metadata.format.duration;
              resolve({ attachmentDuration, key: fileFromAws.Key });
            });
          });
        } else {
          fs.mkdir('uploads/thumbnails/', { recursive: true }, (err) => {
            if (err) throw err;
          });
          return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(fileFromAws.Location, function (err, metadata) {
              attachmentDuration = metadata.format.duration;
            });
            ffmpeg(fileFromAws.Location)
              .on('filenames', function (filenames) {
                filePath = 'uploads/thumbnails/' + filenames[0];
              })
              .on('end', function (filenames) {
                resolve({ attachmentDuration, key: fileFromAws.Key });
              })
              .on('error', function (err) {
                console.error(err);
              })
              .screenshots({
                // Will take screenshots at 20%, 40%, 60% and 80% of the video
                count: 1,
                folder: 'uploads/thumbnails',
                size: '320x240',
                filename: 'thumbnail-temp.png',
              });
          });
        }
      } else {
        return { key: fileFromAws.Key };
      }
    } catch (err) {
      throw err;
    }
  }

  async getSignedUrlFromKey(key) {
    try {
      const result = await this.s3BucketService.getSignedUrl(key);
      return { signedUrl: result };
    } catch (err) {
      throw err;
    }
  }

  async starAnnouncement(
    user: User,
    starAnnouncementInput: AnnouncementStarInput,
  ) {
    try {
      const { companyId, announcementId, starred } = starAnnouncementInput;
      const { _id: userId } = user;

      const company = await this.companyRepo.findOne({
        _id: companyId,
      });
      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.canManageAnnoucement(userId, companyId);

      const announcement = await this.annoucementRepo.findOneAndUpdate(
        {
          _id: announcementId,
        },
        {
          starred,
        },
      );

      if (!announcement) throw new NotFoundException('announcement not found');

      return announcement;
    } catch (err) {
      throw err;
    }
  }

  async getDraftAnnouncementCount(user: User, companyIdInput: IdOnly) {
    try {
      const { _id: userId } = user;
      const { id: companyId } = companyIdInput;

      const company = await this.companyRepo.findOne({
        _id: companyId,
      });
      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.checkUserIsInCompany(userId, companyId);

      const totalDraftAnnouncement =
        await this.annoucementRepo.totalDraftAnnouncementOfCompany(companyId);

      return {
        totalDrafts: totalDraftAnnouncement,
      };
    } catch (err) {
      throw err;
    }
  }

  async getAnnouncement(
    user: User,
    announcementInput: AnnouncementDetailInput,
  ) {
    try {
      const { companyId, announcementId } = announcementInput;
      const { _id: userId } = user;

      const company = await this.companyRepo.findOne({
        _id: companyId,
      });
      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.checkUserIsInCompany(userId, companyId);

      const { totalInterestedInvestor, totalInvestedInvestor } =
        await this.investorRepo.getTotalInterestedAndInvestedInvestor(
          companyId,
        );
      let totalInvestors = totalInterestedInvestor + totalInvestedInvestor;
      totalInvestors = totalInvestors || 1;

      const announcement = await this.announcementModel.aggregate([
        {
          $match: {
            companyId: new mongoose.Types.ObjectId(companyId),
            deleted: false,
            _id: new mongoose.Types.ObjectId(announcementId),
          },
        },
        {
          $project: {
            _id: '$_id',
            seenPercentage: {
              $multiply: [
                { $divide: [{ $size: '$announcementSeenBy' }, totalInvestors] },
                100,
              ],
            },
            userId: 1,
            companyId: 1,
            title: 1,
            attachment: 1,
            status: 1,
            publishedDate: 1,
            deleted: 1,
            fromAsx: 1,
            createdAt: 1,
            updatedAt: 1,
            announcementSeenBy: 1,
            attachmentTotalPages: 1,
            attachmentSize: 1,
            starred: 1,
            media: 1,
            totalViews: 1,
            isPinned: 1,
          },
        },
      ]);

      if (announcement.length < 1) {
        throw new NotFoundException(Lang.ANNOUNCEMENT_NOT_FOUND);
      }

      return announcement[0];
    } catch (err) {
      throw err;
    }
  }

  splitIntoChunk(arr, chunk) {
    const newArray = [];
    while (arr.length > 0) {
      let tempArray = [];
      tempArray = arr.splice(0, chunk);
      newArray.push(tempArray);
    }
    return newArray;
  }
  async pinAnnouncement(announcementPinInput) {
    const { announcementId, companyId, isPinned } = announcementPinInput;
    if (isPinned === true) {
      await this.annoucementRepo.findAndUpdate(
        { companyId: companyId },
        { $set: { isPinned: false } },
      );
    }
    await this.annoucementRepo.findOneAndUpdate(
      { _id: announcementId, companyId: companyId },
      { $set: { isPinned: isPinned } },
    );
    return { status: 'success' };
  }
}
