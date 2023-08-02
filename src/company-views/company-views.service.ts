import { CompanyRepository } from '@src/company/repository/company.repository';
import { CompanyViewsRepository } from './repository/company-views.repository';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import Lang from '@src/constants/language';
import { DateTime } from 'luxon';
import { BaseRepository } from '@src/event/repository/base.repository';
import mongoose from 'mongoose';

@Injectable()
export class CompanyViewsService {
  constructor(
    private readonly companyViewsRepository: CompanyViewsRepository,
    private readonly companyRepo: CompanyRepository,
  ) {}

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

  async getCompanyViewsEngagementLevel(engagementInput) {
    const { companyId, timeRange } = engagementInput;
    await this.isCompanyValidated(companyId);

    /************** Weekly views in month *********/
    if (timeRange === 'Month') {
      return await this.getMonthlyViewsCountData(companyId);
    }
    /************** Daily views in week *********/
    if (timeRange === '7Days') {
      return await this.getLastSevenDaysViewsCountData(companyId);
    }

    /************** Default 6 month companyViews *********/
    return await this.getLastSixMonthsViewsCountData(companyId);
  }

  private async getLastSixMonthsViewsCountData(companyId: any) {
    const startOfLastSixMonth = DateTime.now()
      .minus({ months: 6 })
      .startOf('day')
      .toJSDate();

    const dailyCompanyViewsStage = [
      {
        $match: {
          companyId: new mongoose.Types.ObjectId(companyId),
          createdAt: {
            $gte: startOfLastSixMonth,
          },
        },
      },
      {
        $project: {
          seenDates: {
            $month: '$createdAt',
          },
          seenBy: '$investorId',
          companyId: 1,
        },
      },
      {
        $group: {
          _id: '$seenDates',
          totalSeen: {
            $sum: { $cond: [{ $ne: ['$seenDates', ''] }, 1, 0] },
          },
          companyId: { $first: '$companyId' },
          seenDates: { $first: '$seenDates' },
        },
      },
    ];

    const monthlyCompanyViews = await this.companyViewsRepository.aggregate(
      dailyCompanyViewsStage,
    );

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

    const companyViewsOfLastSixMonths = [];
    let totalViewsInThisSixMonths = 0;
    const startMonth = DateTime.now()
      .minus({
        months: 6,
      })
      .startOf('day').month;

    for (let i = 0; i < 7; i++) {
      const monthIndex = (startMonth + i) % 12;
      const month = monthArray[monthIndex];

      const matchedEvent = monthlyCompanyViews.find(
        (event) => event.seenDates - 1 === monthIndex,
      );

      if (matchedEvent) {
        totalViewsInThisSixMonths += matchedEvent.totalSeen;
        companyViewsOfLastSixMonths.push({
          totalSeen: matchedEvent.totalSeen,
          seenPercentage: 0,
          date: month,
        });
      } else {
        companyViewsOfLastSixMonths.push({
          totalSeen: 0,
          seenPercentage: 0,
          date: month,
        });
      }
    }

    const previousSixMonthsStartDate = DateTime.now()
      .minus({ months: 12 })
      .startOf('day')
      .toJSDate();

    const totalViewsInPreviousSixMonths =
      await this.companyViewsRepository.getViewsCountBetweenTwoDate(
        companyId,
        previousSixMonthsStartDate,
        startOfLastSixMonth,
      );
    const changeInViews = totalViewsInThisSixMonths - totalViewsInPreviousSixMonths;

    //If the changeInViews is greater than 0 but totalViewsInLastMonth is 0 then set changeInViewsPercentage to 100.
    const changeInViewsPercentage =
      totalViewsInPreviousSixMonths > 0
        ? (changeInViews / totalViewsInPreviousSixMonths) * 100
        : changeInViews > 0
        ? 100
        : 0;

    const payloadToReturn = {
      data: companyViewsOfLastSixMonths,
      changeInEngagementLevel: changeInViewsPercentage,
    };

    return payloadToReturn;
  }

  private async getLastSevenDaysViewsCountData(companyId: string) {
    const currentWeekStart = DateTime.now()
      .minus({ days: 6 })
      .startOf('day')
      .toJSDate();

    const dailyCompanyViewsStage = [
      {
        $match: {
          companyId: new mongoose.Types.ObjectId(companyId),
          createdAt: {
            $gte: currentWeekStart,
          },
        },
      },
      {
        $project: {
          seenDay: {
            $dayOfWeek: '$createdAt',
          },
          seenBy: '$investorId',
          companyId: 1,
        },
      },
      {
        $group: {
          _id: '$seenDay',
          totalSeen: {
            $sum: { $cond: [{ $ne: ['$seenDay', ''] }, 1, 0] },
          },
          companyId: { $first: '$companyId' },
          seenDay: { $first: '$seenDay' },
        },
      },
    ];

    const dailyCompanyViews = await this.companyViewsRepository.aggregate(
      dailyCompanyViewsStage,
    );

    const dayArray = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const companyViewsOfLastSevenDays = [];

    let totalViewsInThisWeek = 0;
    const startDay = DateTime.now().minus({ days: 6 }).startOf('day').weekday;
    for (let i = 0; i < 7; i++) {
      const dayIndex = (startDay + i) % 7;
      const day = dayArray[dayIndex];

      const matchedEvent = dailyCompanyViews.find(
        (event) => event.seenDay - 1 === dayIndex,
      );

      if (matchedEvent) {
        totalViewsInThisWeek += matchedEvent.totalSeen;
        companyViewsOfLastSevenDays.push({
          totalSeen: matchedEvent.totalSeen,
          seenPercentage: 0,
          date: day,
        });
      } else {
        companyViewsOfLastSevenDays.push({
          totalSeen: 0,
          seenPercentage: 0,
          date: day,
        });
      }
    }

    const lastWeekStartDate = DateTime.now()
      .minus({ days: 13 })
      .startOf('day')
      .toJSDate();

    const totalViewsInLastWeek =
      await this.companyViewsRepository.getViewsCountBetweenTwoDate(
        companyId,
        lastWeekStartDate,
        currentWeekStart,
      );
    const changeInViews = totalViewsInThisWeek - totalViewsInLastWeek;

    //If the changeInViews is greater than 0 but totalViewsInLastMonth is 0 then set changeInViewsPercentage to 100.
    const changeInViewsPercentage =
      totalViewsInLastWeek > 0
        ? (changeInViews / totalViewsInLastWeek) * 100
        : changeInViews > 0
        ? 100
        : 0;

    const payloadToReturn = {
      data: companyViewsOfLastSevenDays,
      changeInEngagementLevel: changeInViewsPercentage,
    };

    return payloadToReturn;
  }

  private async getMonthlyViewsCountData(companyId: string) {
    const currentMonthStart = DateTime.now()
      .minus({ days: 30 })
      .startOf('day')
      .toJSDate();

    const weeklyCompanyViewsStage = [
      {
        $match: {
          companyId: new mongoose.Types.ObjectId(companyId),
          createdAt: {
            $gte: currentMonthStart,
          },
        },
      },
      {
        $project: {
          seenWeeks: {
            $isoWeek: '$createdAt',
          },
          seenBy: '$investorId',
          companyId: 1,
        },
      },
      {
        $group: {
          _id: '$seenWeeks',
          totalSeen: {
            $sum: { $cond: [{ $ne: ['$seenWeeks', ''] }, 1, 0] },
          },
          companyId: { $first: '$companyId' },
          seenWeeks: { $first: '$seenWeeks' },
        },
      },
    ];

    const weeklyCompanyViews = await this.companyViewsRepository.aggregate(
      weeklyCompanyViewsStage,
    );

    const companyViewsOfPastMonthsInWeek = [];
    let totalViewsInThisMonth = 0;
    for (let i = 3; i >= 0; i--) {
      const weekNumber = DateTime.now().weekNumber - i;
      const matchedEvent = weeklyCompanyViews.find(
        (companyViews) => companyViews.seenWeeks === weekNumber,
      );
      const week = `Week${weekNumber}`;
      if (matchedEvent) {
        totalViewsInThisMonth += matchedEvent.totalSeen;
        companyViewsOfPastMonthsInWeek.push({
          totalSeen: matchedEvent.totalSeen,
          seenPercentage: 0,
          date: week,
        });
      } else {
        companyViewsOfPastMonthsInWeek.push({
          totalSeen: 0,
          seenPercentage: 0,
          date: week,
        });
      }
    }

    const lastMonthStartDate = DateTime.now()
      .minus({ days: 60 })
      .startOf('day')
      .toJSDate();

    const totalViewsInLastMonth =
      await this.companyViewsRepository.getViewsCountBetweenTwoDate(
        companyId,
        lastMonthStartDate,
        currentMonthStart,
      );
    const changeInViews = totalViewsInThisMonth - totalViewsInLastMonth;

    //If the changeInViews is greater than 0 but totalViewsInLastMonth is 0 then set changeInViewsPercentage to 100.
    const changeInViewsPercentage =
      totalViewsInLastMonth > 0
        ? (changeInViews / totalViewsInLastMonth) * 100
        : changeInViews > 0
        ? 100
        : 0;

    const payloadToReturn = {
      data: companyViewsOfPastMonthsInWeek,
      changeInEngagementLevel: changeInViewsPercentage,
    };

    return payloadToReturn;
  }
}
