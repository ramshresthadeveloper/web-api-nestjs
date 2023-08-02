import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CompanyEvent, CompanyEventDocument } from './entities/event.entity';
import { InvestorRepository } from '@src/investor/repository/investor.repository';
import { DateTime } from 'luxon';
import * as csvWriter from 'csv-writer';
import { S3BucketService } from '@src/s3-bucket/s3-bucket.service';
import { User } from '@src/user/entities/user.entity';
import { EventListInput } from './dto/input/company-event-list.input';
import { CompanyRepository } from '@src/company/repository/company.repository';
import Lang from '@src/constants/language';
import { CompanyEventRepository } from './repository/event.repository';
import { CompanyEventInput } from './dto/input/company-event.input';
import { CompanyEventEditInput } from './dto/input/compnay-event-edit.input';
import { CompanyEventDetailInput } from './dto/input/company-detail.input';
import { NotificationService } from '@notification/services/notification.service';
import { ActivityService } from '@activity/activity.service';

@Injectable()
export class CompanyEventService {
  constructor(
    @InjectModel(CompanyEvent.name)
    private companyEventModel: Model<CompanyEventDocument>,
    private readonly investorRepo: InvestorRepository,
    private readonly s3BucketService: S3BucketService,
    private readonly companyRepo: CompanyRepository,
    private readonly companyEventRepo: CompanyEventRepository,
    private readonly notificationService: NotificationService,
    private readonly activityService: ActivityService,
  ) {}

  millitaryTimeInMilliseconds(date, time) {
    const [hours, minutes] = time.split(':');
    date = new Date(date);
    date.setHours(+hours, +minutes, 0, 0);
    return date.getTime();
  }

  async checkUserIsInCompany(userId, companyId) {
    try {
      const company = await this.companyRepo.findOne({
        _id: companyId,
      });
      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      const userBelongsToCompany =
        await this.companyRepo.checkIfUserBelongsToCompany(userId, companyId);

      if (!userBelongsToCompany) {
        throw new ForbiddenException();
      }
    } catch (err) {
      throw err;
    }
  }

  async canCreateEvent(userId, companyId) {
    const company = await this.companyRepo.hasCreateEventPermission(
      userId,
      companyId,
    );

    if (!company) {
      throw new ForbiddenException(Lang.NO_CREATE_EVENT_PERMISSION);
    }

    return company;
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

  async getCompanyEventEngagementLevel(engagementInput) {
    try {
      const { companyId, timeRange } = engagementInput;
      await this.isCompanyValidated(companyId);

      const totalEvents = await this.companyEventModel
        .find({
          companyId,
          eventAttendies: 'investors',
          deleted: false,
        })
        .count();

      const { totalInterestedInvestor, totalInvestedInvestor } =
        await this.investorRepo.getTotalInterestedAndInvestedInvestor(
          companyId,
        );

      const totalInvestors =
        totalInterestedInvestor + totalInvestedInvestor || 1;

      const totalExpectedViews = totalEvents * totalInvestors;

      let payloadToReturn;

      /************** Weekly engagement in month *********/

      if (timeRange === 'Month') {
        const lastMonthStart = DateTime.now()
          .minus({ days: 30 })
          .startOf('day')
          .toJSDate();

        const weeklyEvent = await this.companyEventModel.aggregate([
          {
            $match: {
              companyId: new mongoose.Types.ObjectId(companyId),
              eventAttendies: 'investors',
              deleted: false,
            },
          },
          {
            $unwind: {
              path: '$eventSeenBy',
            },
          },
          { $match: { 'eventSeenBy.seenAt': { $gte: lastMonthStart } } },
          {
            $project: {
              seenWeeks: {
                $isoWeek: '$eventSeenBy.seenAt',
              },
              seenBy: '$eventSeenBy.investorId',
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
              companyId: { $first: '$companyId' },
              seenBy: { $first: '$seenBy' },
              seenWeeks: { $first: '$seenWeeks' },
            },
          },
          { $sort: { seenWeeks: 1 } },
          {
            $project: {
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
          const matchedEvent = weeklyEvent.find(
            (event) => event.seenWeeks === weekNumber,
          );
          const week = `Week${weekNumber}`;

          engagementLevelOfPastMonthsInWeek.push(
            matchedEvent
              ? {
                  totalSeen: matchedEvent.totalSeen,
                  seenPercentage: matchedEvent.seenPercentage,
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

        const dailyEvents = await this.companyEventModel.aggregate([
          {
            $match: {
              companyId: new mongoose.Types.ObjectId(companyId),
              eventAttendies: 'investors',
              deleted: false,
            },
          },
          {
            $unwind: {
              path: '$eventSeenBy',
            },
          },
          { $match: { 'eventSeenBy.seenAt': { $gte: pastSeventhDay } } },
          {
            $project: {
              seenDay: {
                $dayOfWeek: '$eventSeenBy.seenAt',
              },
              seenBy: '$eventSeenBy.investorId',
              companyId: 1,
              year: {
                $year: '$eventSeenBy.seenAt',
              },
              month: { $month: '$eventSeenBy.seenAt' },
              day: { $dayOfMonth: '$eventSeenBy.seenAt' },
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

          const matchedEvent = dailyEvents.find(
            (event) => event.seenDay - 1 === dayIndex,
          );
          engagementLevelOfPastSevenDays.push(
            matchedEvent
              ? {
                  totalSeen: matchedEvent.totalSeen,
                  seenPercentage: matchedEvent.seenPercentage,
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

        const previousWeekDailyEvent = await this.companyEventModel.aggregate([
          {
            $match: {
              companyId: new mongoose.Types.ObjectId(companyId),
              eventAttendies: 'investors',
              deleted: false,
            },
          },
          {
            $unwind: {
              path: '$eventSeenBy',
            },
          },
          {
            $match: {
              'eventSeenBy.seenAt': {
                $gte: previousWeekTodayStart,
                $lte: previousWeekTodayEnd,
              },
            },
          },
          {
            $project: {
              seenDay: {
                $dayOfWeek: '$eventSeenBy.seenAt',
              },
              seenBy: '$eventSeenBy.investorId',
              companyId: 1,
              year: {
                $year: '$eventSeenBy.seenAt',
              },
              month: { $month: '$eventSeenBy.seenAt' },
              day: { $dayOfMonth: '$eventSeenBy.seenAt' },
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

        const totalSeenInPreviousWeekDay = previousWeekDailyEvent[0]
          ? previousWeekDailyEvent[0].totalSeen
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

      const events = await this.companyEventModel.aggregate([
        {
          $match: {
            companyId: new mongoose.Types.ObjectId(companyId),
            eventAttendies: 'investors',
            deleted: false,
          },
        },
        {
          $unwind: {
            path: '$eventSeenBy',
          },
        },
        { $match: { 'eventSeenBy.seenAt': { $gte: startMonthDate } } },
        {
          $project: {
            seenDates: {
              $month: '$eventSeenBy.seenAt',
            },
            seenBy: '$eventSeenBy.investorId',
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
            companyId: { $first: '$companyId' },
            seenBy: { $first: '$seenBy' },
            seenDates: { $first: '$seenDates' },
          },
        },
        { $sort: { seenDates: 1 } },
        {
          $project: {
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
        const matchedEvent = events.find(
          (event) => event.seenDates - 1 === monthIndex,
        );
        engaementLevelOfPastSixMonths.push(
          matchedEvent
            ? {
                totalSeen: matchedEvent.totalSeen,
                seenPercentage: matchedEvent.seenPercentage,
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

  async getCompanyEventEngagementLevelCsv(engagementInput) {
    try {
      const { companyId, timeRange } = engagementInput;
      await this.isCompanyValidated(companyId);

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

        const dailyCompanyEvents = await this.companyEventModel.aggregate([
          {
            $match: {
              companyId: new mongoose.Types.ObjectId(companyId),
              eventAttendies: 'investors',
              deleted: false,
            },
          },
          {
            $unwind: {
              path: '$eventSeenBy',
            },
          },
          { $match: { 'eventSeenBy.seenAt': { $gte: pastSeventhDay } } },
          {
            $project: {
              seenDay: {
                $dayOfWeek: '$eventSeenBy.seenAt',
              },
              seenBy: '$eventSeenBy.investorId',
              _id: 1,
              userId: 1,
              companyId: 1,
              title: 1,
              deleted: 1,
              eventSeenBy: 1,
              createdAt: 1,
            },
          },
          {
            $group: {
              _id: {
                seenDay: '$seenDay',
                companyEventId: '$_id',
              },
              totalSeen: {
                $sum: { $cond: [{ $ne: ['$seenDay', ''] }, 1, 0] },
              },
              companyEventId: { $first: '$_id' },
              companyId: { $first: '$companyId' },
              seenBy: { $first: '$seenBy' },
              seenDay: { $first: '$seenDay' },
              title: { $first: '$title' },
            },
          },
          {
            $project: {
              companyEventId: 1,
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

        const dataForCsvWithDup = dailyCompanyEvents.map(
          (companyEvent, index) => {
            const companyEventDataForCsv: any = {};

            for (let i = 0; i < 7; i++) {
              const dayIndex = (startDay + 1 + i) % 7;
              const day = dayArray[dayIndex];

              const matchedEvents =
                companyEvent.seenDay - 1 === dayIndex ? companyEvent : null;

              if (index === 0) {
                dataForHeader.push({
                  id: day,
                  title: day,
                });
              }

              if (i === 0) {
                companyEventDataForCsv.postTitle = companyEvent.title;
                companyEventDataForCsv._id = companyEvent.companyEventId;
              }
              companyEventDataForCsv[day] = matchedEvents
                ? companyEvent.seenPercentage
                : 0;
            }
            return companyEventDataForCsv;
          },
        );

        const dataForCsvWithOutDup = dataForCsvWithDup.reduce((a, c) => {
          const x = a.find((e) => {
            return e._id.toString() == c._id.toString();
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

        const weeklyCompanyEvents = await this.companyEventModel.aggregate([
          {
            $match: {
              companyId: new mongoose.Types.ObjectId(companyId),
              eventAttendies: 'investors',
              deleted: false,
            },
          },
          {
            $unwind: {
              path: '$eventSeenBy',
            },
          },
          { $match: { 'eventSeenBy.seenAt': { $gte: lastMonthStart } } },
          {
            $project: {
              seenWeeks: {
                $isoWeek: '$eventSeenBy.seenAt',
              },
              _id: 1,
              userId: 1,
              companyId: 1,
              title: 1,
              deleted: 1,
              eventSeenBy: 1,
              createdAt: 1,
            },
          },
          {
            $group: {
              _id: {
                companyEventId: '$_id',
                seenWeeks: '$seenWeeks',
              },
              totalSeen: {
                $sum: { $cond: [{ $ne: ['$seenWeeks', ''] }, 1, 0] },
              },
              companyEventId: { $first: '$_id' },
              companyId: { $first: '$companyId' },
              seenBy: { $first: '$eventSeenBy' },
              seenWeeks: { $first: '$seenWeeks' },
              title: { $first: '$title' },
            },
          },
          { $sort: { seenWeeks: 1 } },
          {
            $project: {
              companyEventId: 1,
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

        const dataForCsvWithDup = weeklyCompanyEvents.map(
          (companyEvent, index) => {
            const companyEventDataForCsv: any = {};
            for (let i = 3; i >= 0; i--) {
              const weekNumber = DateTime.now().weekNumber - i;

              const matchedEvents =
                companyEvent.seenWeeks === weekNumber ? companyEvent : null;

              const week = `week${weekNumber}`;

              if (index === 0) {
                dataForHeader.push({
                  id: week,
                  title: week,
                });
              }

              if (i === 3) {
                companyEventDataForCsv.postTitle = companyEvent.title;
                companyEventDataForCsv._id = companyEvent.companyEventId;
              }
              companyEventDataForCsv[week] = matchedEvents
                ? companyEvent.seenPercentage
                : 0;
            }
            return companyEventDataForCsv;
          },
        );

        const dataForCsvWithOutDup = dataForCsvWithDup.reduce((a, c) => {
          const x = a.find((e) => {
            return e._id.toString() == c._id.toString();
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

        const companyEvents = await this.companyEventModel.aggregate([
          {
            $match: {
              companyId: new mongoose.Types.ObjectId(companyId),
              eventAttendies: 'investors',
              deleted: false,
            },
          },
          {
            $unwind: {
              path: '$eventSeenBy',
            },
          },
          { $match: { 'eventSeenBy.seenAt': { $gte: startMonthDate } } },
          {
            $project: {
              seenDates: {
                $month: '$eventSeenBy.seenAt',
              },
              _id: 1,
              userId: 1,
              companyId: 1,
              title: 1,
              deleted: 1,
              eventSeenBy: 1,
              createdAt: 1,
            },
          },
          {
            $group: {
              _id: {
                companyEventId: '$_id',
                seenDates: '$seenDates',
              },
              totalSeen: {
                $sum: { $cond: [{ $ne: ['$seenDates', ''] }, 1, 0] },
              },
              companyEventId: { $first: '$_id' },
              companyId: { $first: '$companyId' },
              seenBy: { $first: '$seenBy' },
              seenDates: { $first: '$seenDates' },
              title: { $first: '$title' },
            },
          },
          { $sort: { seenDates: 1 } },
          {
            $project: {
              companyEventId: 1,
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

        const dataForCsvWithDup = companyEvents.map((companyEvent, index) => {
          const companyEventDataForCsv: any = {};
          for (let i = 0; i < 6; i++) {
            const monthIndex = (Number(startMonth) - 1 + i) % 12;
            const month = monthArray[monthIndex];

            const matchedEvents =
              companyEvent.seenDates - 1 === monthIndex ? companyEvent : null;
            if (index === 0) {
              dataForHeader.push({
                id: month,
                title: month,
              });
            }
            if (i === 0) {
              companyEventDataForCsv.postTitle = companyEvent.title;
              companyEventDataForCsv._id = companyEvent.companyEventId;
            }
            companyEventDataForCsv[month] = matchedEvents
              ? companyEvent.seenPercentage
              : 0;
          }
          return companyEventDataForCsv;
        });

        const dataForCsvWithOutDup = dataForCsvWithDup.reduce((a, c) => {
          const x = a.find((e) => {
            return e._id.toString() == c._id.toString();
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
        'csv/companyEvents',
      );

      return {
        message: csvFileUrl.Key,
      };
    } catch (err) {
      throw err;
    }
  }

  async getCompanyEvents(user: User, eventListInput: EventListInput) {
    try {
      const { companyId, date, page, limit } = eventListInput;
      await this.checkUserIsInCompany(user._id, companyId);
      let year1 = date.getFullYear();
      let month1 = date.getMonth();
      let firstDay = new Date(year1, month1, 1);
      let lastDay = new Date(year1, month1 + 1, 0, 23, 59, 59);

      const stages = [
        {
          $match: {
            companyId: new mongoose.Types.ObjectId(companyId),
            $or: [
              { date: { $gte: firstDay, $lt: lastDay } },
              {
                endDate: {
                  $exists: true,
                  $ne: null,
                  $gte: firstDay,
                  $lt: lastDay,
                },
              },
            ],
          },
        },
        { $sort: { date: 1 } },
      ];

      const events = await this.companyEventRepo.aggregatePaginate(stages, {
        page,
        limit,
      });
      return events;
    } catch (err) {
      throw err;
    }
  }

  async addCompanyEvent(user: User, eventInput: CompanyEventInput) {
    try {
      const {
        companyId,
        title,
        description,
        location,
        allDay,
        date,
        endDate,
        eventAttendies,
        attachment,
        startTime,
        endTime,
        isHoliday,
      } = eventInput;
      const { _id: userId } = user;

      if (!allDay) {
        if (!startTime || !endTime) {
          throw new BadRequestException(Lang.START_END_TIME_REQUIRED);
        }
      }
      if (endDate && date > endDate) {
        throw new BadRequestException(Lang.EVENT_END_DATE_ERROR);
      }

      const company = await this.canCreateEvent(userId, companyId);
      await this.isCompanyValidated(companyId);

      const event = await this.companyEventRepo.create({
        companyId,
        title,
        description,
        location,
        allDay,
        isHoliday,
        date,
        endDate,
        eventAttendies,
        attachment,
        userId,
        publishedDate: new Date(),
        startTime: allDay ? null : startTime,
        endTime: allDay ? null : endTime,
      });

      this.notificationService.createEventAddedNotification(
        user,
        {
          companyId,
          title: 'Event created',
          message: `${company.legalBusinessName} just created an event.`,
          metaData: {
            eventId: event._id,
            companyId,
            senderId: user._id,
          },
          eventAttendies,
        },
        true,
      );

      this.activityService.createActivity({
        userId,
        companyId,
        isTeamMember: userId.toString() !== company.userId.toString(),
        activityDescription: Lang.ACTIVITY_EVENT_CREATED,
        jobTitle: user.jobTitle,
      });

      return event;
    } catch (err) {
      throw err;
    }
  }

  async updateCompanyEvent(
    user: User,
    eventUpdateInput: CompanyEventEditInput,
  ) {
    try {
      const {
        companyId,
        title,
        description,
        location,
        allDay,
        date,
        endDate,
        eventAttendies,
        attachment,
        startTime,
        endTime,
        eventId,
        isHoliday,
      } = eventUpdateInput;
      const { _id: userId } = user;

      if (!allDay) {
        if (!startTime || !endTime) {
          throw new BadRequestException(Lang.START_END_TIME_REQUIRED);
        }

        if (
          this.millitaryTimeInMilliseconds(date, startTime) >
          this.millitaryTimeInMilliseconds(date, endTime)
        ) {
          throw new BadRequestException(Lang.INVALID_START_END_TIME);
        }
      }

      if (endDate && date > endDate) {
        throw new BadRequestException(Lang.EVENT_END_DATE_ERROR);
      }

      const event = await this.companyEventRepo.findOne(
        { _id: eventId },
        { _id: 1 },
      );
      if (!event) {
        throw new NotFoundException(Lang.EVENT_NOT_FOUND);
      }

      if (
        !(await this.companyEventRepo.canModifyEvent(
          event._id,
          userId,
          companyId,
        ))
      ) {
        throw new ForbiddenException(Lang.NO_UPDATE_EVENT_PERMISSION);
      }
      await this.isCompanyValidated(companyId);

      const updatedEvent = await this.companyEventRepo.findOneAndUpdate(
        {
          _id: eventId,
        },
        {
          companyId,
          title,
          description,
          location,
          allDay,
          date,
          endDate,
          eventAttendies,
          attachment,
          userId,
          isHoliday,
          startTime: allDay ? null : startTime,
          endTime: allDay ? null : endTime,
        },
      );

      if (!updatedEvent) {
        throw new NotFoundException(Lang.EVENT_NOT_FOUND);
      }

      this.notificationService.createEventAddedNotification(
        user,
        {
          companyId,
          title: 'Event updated',
          message: `${user.userName} just updated an event.`,
          metaData: {
            eventId: event._id,
            companyId,
            senderId: user._id,
          },
          eventAttendies,
        },
        true,
      );

      return updatedEvent;
    } catch (err) {
      throw err;
    }
  }

  async deleteCompanyEvent(
    user: User,
    eventDeleteInput: CompanyEventDetailInput,
  ) {
    try {
      const { _id: userId } = user;
      const { companyId, eventId } = eventDeleteInput;

      const company = await this.canCreateEvent(userId, companyId);
      await this.isCompanyValidated(companyId);

      const event = await this.companyEventRepo.findOne(
        { _id: eventId },
        { _id: 1, eventAttendies: 1 },
      );
      if (!event) {
        throw new NotFoundException(Lang.EVENT_NOT_FOUND);
      }

      if (
        !(await this.companyEventRepo.canModifyEvent(
          event._id,
          userId,
          companyId,
        ))
      ) {
        throw new ForbiddenException(Lang.NO_DELETE_EVENT_PERMISSION);
      }

      const deletedEvent = await this.companyEventRepo.findOneAndDelete({
        _id: eventId,
      });

      if (!deletedEvent) {
        throw new NotFoundException(Lang.EVENT_NOT_FOUND);
      }

      this.notificationService.createEventAddedNotification(
        user,
        {
          companyId,
          message: `${user.userName} just deleted an event.`,
          title: 'Event deleted',
          metaData: {
            eventId: event._id,
            companyId,
            senderId: user._id,
          },
          eventAttendies: event.eventAttendies,
        },
        false,
      );

      this.activityService.createActivity({
        userId,
        companyId,
        isTeamMember: userId.toString() !== company.userId.toString(),
        activityDescription: Lang.ACTIVITY_EVENT_DELETED,
        jobTitle: user.jobTitle,
      });

      return deletedEvent;
    } catch (err) {
      throw err;
    }
  }

  async getCompanyEvent(user: User, eventDetailInput: CompanyEventDetailInput) {
    try {
      const { _id: userId } = user;
      const { eventId, companyId } = eventDetailInput;

      await this.checkUserIsInCompany(userId, companyId);
      await this.isCompanyValidated(companyId);

      const event = await this.companyEventRepo.findOne({ _id: eventId });
      if (!event) {
        throw new NotFoundException(Lang.EVENT_NOT_FOUND);
      }

      return event;
    } catch (err) {
      throw err;
    }
  }
}
