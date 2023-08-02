import { GetEnquiriesHistoryInput } from '@enquiry/dto/input/get.enquiries.history.input';
import { BrowserInfoService } from './../../browser_info/browser_info.service';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as Pdfmake from 'pdfmake';
import { join } from 'path';

import { User } from '@src/user/entities/user.entity';
import { CompanyRepository } from '@src/company/repository/company.repository';
import Lang from '@src/constants/language';
import { Enquiry, EnquiryDocument } from '../entities/enquiry.entity';
import { EnquiryRepository } from '../repository/enquiry.repository';
import { NewAndOutstandingQuestionsInput } from '../dto/input/new-outstanding-question.input';
import { EnquiryResponseRepository } from '../repository/enquiry-response.repository';
import { InvestorSatisfactionInput } from '../dto/input/investorSatisfaction.input';
import { EnquiryQuestionListInput } from '../dto/input/enquiry-question-list.input';
import { AssignEnquiriesToCategoriesInput } from '../dto/input/assign-enquiries-to-category.input';
import { EnquiryCategoryRepository } from '../repository/enquiry-category.repository';
import { EnquiryDetailInput } from '../dto/input/enquiry-detail.input';
import { ArchiveOrResolveEnquiriesInput } from '../dto/input/archive.or.resolve.enquiries.input';
import { AssignEnquiriesToStaff } from '../dto/input/assign-enquiry-to-staff.input';
import { ExportEnquiryPdfInput } from '../dto/input/export-enquiry-pdf.input';
import { S3BucketService } from '@src/s3-bucket/s3-bucket.service';
import { NotificationService } from '@notification/services/notification.service';
import { ActivityService } from '@activity/activity.service';
import { MailchimpService } from '@src/mailchimp/mailchimp.service';

@Injectable()
export class EnquiryService {
  constructor(
    private readonly enquiryRepo: EnquiryRepository,
    @InjectModel(Enquiry.name)
    private readonly enquiryModel: Model<EnquiryDocument>,
    private readonly companyRepo: CompanyRepository,
    private readonly enquiryResponseRepo: EnquiryResponseRepository,
    private readonly enquiryCategoryRepo: EnquiryCategoryRepository,
    private readonly s3BucketService: S3BucketService,
    private readonly notificationService: NotificationService,
    private readonly activityService: ActivityService,
    private readonly mailchimpService: MailchimpService,
    private readonly browserInfoService: BrowserInfoService,
  ) {}

  async checkUserIsInCompany(userId, companyId) {
    try {
      const company = await this.companyRepo.findOne(
        {
          _id: companyId,
        },
        { _id: 1 },
      );
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

  async canManageEnquries(userId, companyId) {
    const company = await this.companyRepo.questionMgmtPermission(
      userId,
      companyId,
    );

    if (!company) {
      throw new ForbiddenException(Lang.NO_ENQUIRY_MGMT_PERMISSION);
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

  async getNewQuestionsOfDayAndTotalOutstandings(
    user: User,
    newAndOutstandingQuestionInput: NewAndOutstandingQuestionsInput,
  ) {
    try {
      const { companyId } = newAndOutstandingQuestionInput;

      await this.checkUserIsInCompany(user._id, companyId);

      const result =
        await this.enquiryRepo.getnewAndTotalOutstandingQuestionOfCompany(
          companyId,
        );

      return {
        totalOutstandingQuestions:
          result.length > 0 ? result[0].unResolvedQuestions : 0,
        totalNewQuestions: result.length > 0 ? result[0].newQuestions : 0,
      };
    } catch (err) {
      throw err;
    }
  }

  async getInvestorSatisfaction(
    user: User,
    investorSatisfactionInput: InvestorSatisfactionInput,
  ) {
    try {
      const { companyId } = investorSatisfactionInput;

      await this.checkUserIsInCompany(user._id, companyId);

      return await this.enquiryResponseRepo.getInvestorResponse(companyId);
    } catch (err) {
      throw err;
    }
  }

  async getEnquiryQuestions(
    user: User,
    enquiryListInput: EnquiryQuestionListInput,
  ) {
    try {
      const {
        companyId,
        enquiryStatus,
        categoryId,
        investorStatus,
        sortDir,
        page,
        limit,
        searchText,
        assigneeId,
      } = enquiryListInput;

      const initialMatchPayload: any = {
        companyId: new mongoose.Types.ObjectId(companyId),
      };

      if (searchText) {
        initialMatchPayload.subject = { $regex: searchText, $options: 'i' };
      }
      const stages: any = [
        { $match: initialMatchPayload },
        { $sort: { createdAt: sortDir === 'asc' ? 1 : -1 } },
      ];

      await this.checkUserIsInCompany(user._id, companyId);

      if (enquiryStatus) {
        if (enquiryStatus === 'outstanding') {
          stages.push({
            $match: {
              $and: [
                {
                  $or: [{ assignedTo: '' }, { assignedTo: null }],
                },
                {
                  $or: [{ resolvedBy: '' }, { resolvedBy: { $exists: false } }],
                },
                {
                  archivedBy: { $in: [null, undefined] },
                },
              ],
            },
          });
        }
        if (enquiryStatus === 'assigned') {
          stages.push({
            $match: {
              $and: [
                { assignedTo: { $ne: null } },
                { assignedTo: { $exists: true } },
                {
                  $or: [{ resolvedBy: '' }, { resolvedBy: { $exists: false } }],
                },
                {
                  archivedBy: { $in: [null, undefined] },
                },
              ],
            },
          });
        }
        if (enquiryStatus === 'resolved') {
          stages.push({
            $match: {
              $and: [
                { resolvedBy: { $exists: true, $ne: null } },
                {
                  archivedBy: { $in: [null, undefined] },
                },
              ],
            },
          });
        }
        if (enquiryStatus === 'archived') {
          stages.push({
            $match: { archivedBy: { $exists: true, $ne: null } },
          });
        }
      }

      if (categoryId) {
        stages.push({
          $match: {
            enquiryCategoryId: new mongoose.Types.ObjectId(categoryId),
          },
        });
      }

      if (assigneeId) {
        stages.push({
          $match: {
            assignedTo: new mongoose.Types.ObjectId(assigneeId),
          },
        });
      }

      if (investorStatus) {
        if (investorStatus === 'potential') {
          stages.push(
            {
              $lookup: {
                from: 'investors',
                let: { companyId: '$companyId', investorId: '$investorId' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $in: ['$$companyId', '$interestedCompanies'] },
                          { $eq: ['$$investorId', '$_id'] },
                        ],
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      firstName: 1,
                      lastName: 1,
                      userName: 1,
                      email: 1,
                      mobileNum: 1,
                      verifiedAt: 1,
                      investorStatus: 'potential',
                    },
                  },
                ],
                as: 'potentialInvestor',
              },
            },
            {
              $unwind: {
                path: '$potentialInvestor',
              },
            },
          );
        } else {
          stages.push(
            {
              $lookup: {
                from: 'investors',
                let: { companyId: '$companyId', investorId: '$investorId' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $in: ['$$companyId', '$investedCompanies'] },
                          { $eq: ['$$investorId', '$_id'] },
                        ],
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      firstName: 1,
                      lastName: 1,
                      userName: 1,
                      email: 1,
                      mobileNum: 1,
                      verifiedAt: 1,
                      investorStatus: 'current',
                    },
                  },
                ],
                as: 'currentInvestor',
              },
            },
            {
              $unwind: {
                path: '$currentInvestor',
              },
            },
          );
        }
      } else {
        stages.push(
          {
            $lookup: {
              from: 'investors',
              let: { companyId: '$companyId', investorId: '$investorId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $in: ['$$companyId', '$interestedCompanies'] },
                        { $eq: ['$$investorId', '$_id'] },
                      ],
                    },
                  },
                },
                {
                  $project: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    userName: 1,
                    email: 1,
                    mobileNum: 1,
                    verifiedAt: 1,
                    investorStatus: 'potential',
                  },
                },
              ],
              as: 'potentialInvestor',
            },
          },
          {
            $unwind: {
              path: '$potentialInvestor',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'investors',
              let: { companyId: '$companyId', investorId: '$investorId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $in: ['$$companyId', '$investedCompanies'] },
                        { $eq: ['$$investorId', '$_id'] },
                      ],
                    },
                  },
                },
                {
                  $project: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    userName: 1,
                    email: 1,
                    mobileNum: 1,
                    verifiedAt: 1,
                    investorStatus: 'current',
                  },
                },
              ],
              as: 'currentInvestor',
            },
          },
          {
            $unwind: {
              path: '$currentInvestor',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      stages.push(
        {
          $lookup: {
            from: 'enquirycategories',
            localField: 'enquiryCategoryId',
            foreignField: '_id',
            as: 'enquiryCategory',
          },
        },
        {
          $unwind: {
            path: '$enquiryCategory',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: 'enquiryresponses',
            localField: '_id',
            foreignField: 'enquiryId',
            as: 'enquiryResponse',
          },
        },
        {
          $unwind: {
            path: '$enquiryResponse',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            companyId: 1,
            investorId: 1,
            subject: 1,
            question: 1,
            audio: 1,
            status: 1,
            enquiryCategoryId: 1,
            enquiryCategoryName: '$enquiryCategory.name',
            assignedTo: 1,
            resolvedBy: 1,
            archivedBy: 1,
            investor: { $ifNull: ['$currentInvestor', '$potentialInvestor'] },
            createdAt: 1,
            rating: '$enquiryResponse.rating',
            enquiryResponse: '$enquiryResponse',
          },
        },
      );

      const result = await this.enquiryRepo.aggregatePaginate(stages, {
        page,
        limit,
      });

      return result;
    } catch (err) {
      throw err;
    }
  }

  async getEnquiriesHistory(
    user: User,
    enquiriesHistoryInput: GetEnquiriesHistoryInput,
  ) {
    try {
      const {
        companyId,
        page,
        limit,
        searchText,
        investorId,
        viewedEnquiryId,
      } = enquiriesHistoryInput;
      await this.checkUserIsInCompany(user._id, companyId);

      const initialMatchPayload: any = {
        companyId: new mongoose.Types.ObjectId(companyId),
        investorId: new mongoose.Types.ObjectId(investorId),
        _id: {
          $ne: new mongoose.Types.ObjectId(viewedEnquiryId),
        },
      };
      if (searchText) {
        initialMatchPayload.subject = { $regex: searchText, $options: 'i' };
      }

      const stages: any = [
        { $match: initialMatchPayload },
        { $sort: { createdAt: -1 } },
      ];
      stages.push(
        {
          $lookup: {
            from: 'enquirycategories',
            localField: 'enquiryCategoryId',
            foreignField: '_id',
            as: 'enquiryCategory',
          },
        },
        {
          $unwind: {
            path: '$enquiryCategory',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: 'enquiryresponses',
            localField: '_id',
            foreignField: 'enquiryId',
            as: 'enquiryResponse',
          },
        },
        {
          $unwind: {
            path: '$enquiryResponse',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'assignedTo',
            foreignField: '_id',
            as: 'assignedUser',
          },
        },
        {
          $unwind: {
            path: '$assignedUser',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'resolvedBy',
            foreignField: '_id',
            as: 'resolver',
          },
        },
        {
          $unwind: {
            path: '$resolver',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            _id: 1,
            companyId: 1,
            investorId: 1,
            subject: 1,
            question: 1,
            audio: 1,
            status: 1,
            enquiryCategoryId: 1,
            enquiryCategoryName: '$enquiryCategory.name',
            assignedTo: 1,
            resolvedBy: 1,
            archivedBy: 1,
            investor: { $ifNull: ['$currentInvestor', '$potentialInvestor'] },
            createdAt: 1,
            rating: '$enquiryResponse.rating',
            enquiryResponse: '$enquiryResponse',
            assigneeName: '$assignedUser.userName',
            resolverName: '$resolver.userName',
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            enquiries: {
              $push: '$$ROOT',
            },
          },
        },
        {
          $project: {
            _id: 1,
            date: {
              $dateToString: {
                format: '%Y-%m',
                date: {
                  $dateFromParts: {
                    year: '$_id.year',
                    month: '$_id.month',
                  },
                },
              },
            },
            enquiries: 1,
          },
        },
        {
          $sort: {
            date: -1,
          },
        },
      );

      const result = await this.enquiryRepo.aggregatePaginate(stages, {
        page,
        limit,
      });

      return result;
    } catch (err) {
      throw err;
    }
  }

  async assignEnquiriesToCategories(
    user: User,
    assignToCategoryInput: AssignEnquiriesToCategoriesInput,
  ) {
    try {
      const { companyId, categoryId, enquiriesIds } = assignToCategoryInput;
      await this.canManageEnquries(user._id, companyId);
      await this.isCompanyValidated(companyId);

      const category = await this.enquiryCategoryRepo.findById(categoryId);
      if (!category) {
        throw new NotFoundException(Lang.ENQUIRY_CATEGORY_NOT_FOUND);
      }

      const data = await this.enquiryRepo.assignCategoryToEnquiries(
        categoryId,
        enquiriesIds,
      );

      return {
        message: `Category has been assigned to ${data.matchedCount} ${
          data.matchedCount > 1 ? 'questions' : 'question'
        } successfully`,
      };
    } catch (err) {
      throw err;
    }
  }

  async getEnquiryQuestion(user: User, enquiryDetailInput: EnquiryDetailInput) {
    try {
      const { companyId, enquiryId } = enquiryDetailInput;
      const { _id: userId } = user;

      await this.checkUserIsInCompany(userId, companyId);
      await this.isCompanyValidated(companyId);

      const enquiryDetail = await this.enquiryRepo.getEnquiryDetail(
        companyId,
        enquiryId,
      );

      if (!enquiryDetail) {
        throw new NotFoundException(Lang.ENQUIRY_NOT_FOUND);
      }

      if (enquiryDetail && enquiryDetail.status === 'delivered') {
        await this.enquiryModel.findByIdAndUpdate(enquiryId, {
          status: 'seen',
        });
      }

      return enquiryDetail;
    } catch (err) {
      throw err;
    }
  }

  async resolveEnquiries(
    user: User,
    resolveEnquiriesInput: ArchiveOrResolveEnquiriesInput,
  ) {
    try {
      const { companyId, enquiriesIds } = resolveEnquiriesInput;
      const { _id: userId } = user;

      const company = await this.canManageEnquries(userId, companyId);
      await this.isCompanyValidated(companyId);

      const resolvedEnquiries = await this.enquiryRepo.resolveEnquiries(
        enquiriesIds,
        userId,
      );

      let messageToSend = Lang.ENQUIRIES_RESOLVED_SUCCESSFULLY;

      if (resolvedEnquiries.matchedCount === 0) {
        messageToSend =
          enquiriesIds.length === 1
            ? Lang.ENQUIRY_NOT_FOUND
            : Lang.ENQUIRIES_NOT_FOUND;
        throw new NotFoundException(messageToSend);
      }

      if (enquiriesIds.length === 1) {
        messageToSend = Lang.ENQUIRY_RESOLVED_SUCCESSFULLY;
      }

      this.activityService.createActivity({
        userId,
        companyId,
        isTeamMember: userId.toString() !== company.userId.toString(),
        activityDescription: Lang.ACTIVITY_ENQUIRY_RESOLVED,
        jobTitle: user.jobTitle,
      });

      return {
        message: messageToSend,
      };
    } catch (err) {
      throw err;
    }
  }

  async archiveEnquiries(
    user: User,
    resolveEnquiriesInput: ArchiveOrResolveEnquiriesInput,
  ) {
    try {
      const { companyId, enquiriesIds } = resolveEnquiriesInput;
      const { _id: userId } = user;

      const company = await this.canManageEnquries(userId, companyId);
      await this.isCompanyValidated(companyId);

      const archivedEnquiries = await this.enquiryRepo.archiveEnquiries(
        enquiriesIds,
        userId,
      );

      let messageToSend = Lang.ENQUIRIES_ARCHIVED_SUCCESSFULLY;

      if (archivedEnquiries.matchedCount === 0) {
        messageToSend =
          enquiriesIds.length === 1
            ? Lang.ENQUIRY_NOT_FOUND
            : Lang.ENQUIRIES_NOT_FOUND;
        throw new NotFoundException(messageToSend);
      }

      if (enquiriesIds.length === 1) {
        messageToSend = Lang.ENQUIRIES_ARCHIVED_SUCCESSFULLY;
      }

      this.activityService.createActivity({
        userId,
        companyId,
        isTeamMember: userId.toString() !== company.userId.toString(),
        activityDescription: Lang.ACTIVITY_ENQUIRY_ARCHIVED,
        jobTitle: user.jobTitle,
      });

      return {
        message: messageToSend,
      };
    } catch (err) {
      throw err;
    }
  }

  async unarchiveEnquiries(
    user: User,
    unarchiveEnquiriesInput: ArchiveOrResolveEnquiriesInput,
  ) {
    try {
      const { companyId, enquiriesIds } = unarchiveEnquiriesInput;
      const { _id: userId } = user;

      const company = await this.canManageEnquries(userId, companyId);
      await this.isCompanyValidated(companyId);

      const archivedEnquiries = await this.enquiryRepo.unarchiveEnquiries(
        enquiriesIds,
        userId,
      );

      let messageToSend = Lang.ENQUIRIES_UNARCHIVED_SUCCESSFULLY;

      if (archivedEnquiries.matchedCount === 0) {
        messageToSend =
          enquiriesIds.length === 1
            ? Lang.ENQUIRY_NOT_FOUND
            : Lang.ENQUIRIES_NOT_FOUND;
        throw new NotFoundException(messageToSend);
      }

      if (enquiriesIds.length === 1) {
        messageToSend = Lang.ENQUIRIES_UNARCHIVED_SUCCESSFULLY;
      }

      this.activityService.createActivity({
        userId,
        companyId,
        isTeamMember: userId.toString() !== company.userId.toString(),
        activityDescription: Lang.ACTIVITY_ENQUIRY_UNARCHIVED,
        jobTitle: user.jobTitle,
      });

      return {
        message: messageToSend,
      };
    } catch (err) {
      throw err;
    }
  }

  async assignEnquiriesToStaff(
    user: User,
    assignEnquiriesToStaff: AssignEnquiriesToStaff,
  ) {
    try {
      const { companyId, enquiriesIds, staffId } = assignEnquiriesToStaff;
      const { _id: userId } = user;

      const company = await this.canManageEnquries(userId, companyId);
      await this.isCompanyValidated(companyId);

      const staff = await this.companyRepo.checkUserIsTeamMember(
        staffId,
        companyId,
      );

      if (!staff) {
        throw new NotFoundException(Lang.STAFF_NOT_IN_TEAM);
      }

      const assignedEnquiries = await this.enquiryRepo.assignEnquiriesToStaff(
        enquiriesIds,
        staffId,
      );

      let messageToSend = Lang.ENQUIRES_ASSIGNED_SUCCESSFULLY;

      if (assignedEnquiries.matchedCount === 0) {
        messageToSend =
          enquiriesIds.length === 1
            ? Lang.ENQUIRY_NOT_FOUND
            : Lang.ENQUIRIES_NOT_FOUND;
        throw new NotFoundException(messageToSend);
      }

      if (enquiriesIds.length === 1) {
        messageToSend = Lang.ENQUIRY_ASSIGNED_SUCCESSFULLY;
      }

      const userObject = {
        _id: user._id,
        userName: user.userName,
        profileImage: user.profileImage ? user.profileImage : '',
        jobTitle: user.jobTitle ? user.jobTitle : 'Company admin',
      };

      this.notificationService.createQueryAssignedNotification({
        assignerId: userId,
        companyId,
        staffId,
        enquiriesIds,
        userObject,
      });

      this.activityService.createActivity({
        userId,
        companyId,
        isTeamMember: userId.toString() !== company.userId.toString(),
        activityDescription: Lang.ACTIVITY_ENQUIRY_ASSIGNED,
        jobTitle: user.jobTitle,
      });

      return {
        message: messageToSend,
      };
    } catch (err) {
      throw err;
    }
  }

  async exportEnquiryPdf(
    user: User,
    exportEnquiryPdfInput: ExportEnquiryPdfInput,
  ) {
    try {
      const { companyId, enquiriesIds } = exportEnquiryPdfInput;
      const { _id: userId } = user;

      await this.checkUserIsInCompany(userId, companyId);
      await this.isCompanyValidated(companyId);

      const enquiries = await this.enquiryRepo.getEnquiriesDetails(
        companyId,
        enquiriesIds,
      );

      if (enquiries.length < 1) {
        throw new BadRequestException('Enquiries not found');
      }

      const pdfData = await this.getPdfBuffer(enquiries);
      const fileFromAws = await this.s3BucketService.uploadFileBuffer(
        pdfData,
        'Application/pdf',
        'announcements',
      );

      return {
        message: fileFromAws.Key,
      };
    } catch (err) {
      throw err;
    }
  }

  async getTotalUnreadQuestions(user: User, companyId: string) {
    const totalUnreadCond = {
      $and: [
        { companyId: companyId },
        {
          $or: [
            { resolvedBy: { $exists: false } },
            { assignedTo: { $exists: false } },
          ],
        },
        { status: 'delivered' },
      ],
    };
    const totalUnread = await this.enquiryRepo.getTotalEnquiry(totalUnreadCond);
    return { total: totalUnread };
  }

  async getPdfBuffer(enquiries) {
    try {
      const fonts = {
        Roboto: {
          normal: join(__dirname, '../../../fonts/Roboto-Regular.ttf'),
          bold: join(__dirname, '../../../fonts/Roboto-Bold.ttf'),
        },
      };

      const pdfMake = new Pdfmake(fonts);

      const docDefination = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        content: [],
        styles: {
          subheader: {
            fontSize: 13,
            margin: [0, 10, 0, 10],
          },
          tablecontent: {
            fontSize: 12,
          },
        },
      };

      const table = {
        headerRows: 1,
        widths: ['8%', '15%', '8%', '15%', '20%', '15%', '8%', '8%'],
        body: [
          [
            { text: 'Investor', bold: true },
            { text: 'Enquiry Subject', bold: true },
            { text: 'Investor Status', bold: true },
            { text: 'Date', bold: true },
            { text: 'Enquiry Question', bold: true },
            { text: 'Attachment', bold: true },
            { text: 'Assigned to', bold: true },
            { text: 'Category', bold: true },
          ],
        ],
      };

      const formatDate = (date) =>
        `${date.getHours().toString().padStart(2, '0')}:${date
          .getMinutes()
          .toString()
          .padStart(2, '0')} ${(date.getMonth() + 1)
          .toString()
          .padStart(2, '0')}/${date
          .getDate()
          .toString()
          .padStart(2, '0')}/${date.getFullYear().toString().padStart(4, '0')}`;
      const enquiryDataPayload = Promise.all(
        enquiries.map(async (enquiry) => {
          if (enquiry.audio != null) {
            enquiry.audio = await this.s3BucketService.getSignedUrl(
              enquiry.audio,
            );
          }
          const investorName =
            (enquiry.investor && enquiry.investor.userName) || '';
          const enquirySubject = enquiry.subject || '';
          const investorStatus =
            (enquiry.investor && enquiry.investor.investorStatus) || '';
          const enquiryDate = enquiry.createdAt
            ? formatDate(new Date(enquiry.createdAt))
            : '';
          const enquiryQuestion = enquiry.question || '';
          const attachment = enquiry.audio || '';
          const assignedTo =
            (enquiry.assignee && enquiry.assignee.userName) || '';
          const categoryName = enquiry.enquiryCategoryName || '';
          return [
            { text: investorName, bold: false, style: 'tablecontent' },
            { text: enquirySubject, bold: false, style: 'tablecontent' },
            { text: investorStatus, bold: false, style: 'tablecontent' },
            { text: enquiryDate, bold: false, style: 'tablecontent' },
            { text: enquiryQuestion, bold: false, style: 'tablecontent' },
            { text: attachment, bold: false, style: 'tablecontent' },
            { text: assignedTo, bold: false, style: 'tablecontent' },
            { text: categoryName, bold: false, style: 'tablecontent' },
          ];
        }),
      );

      table.body.push(...(await enquiryDataPayload));

      docDefination.content.push(
        {
          text: 'Enquiries Table',
          style: 'subheader',
        },
        {
          table,
        },
      );

      const pdfDoc = pdfMake.createPdfKitDocument(docDefination, {});
      pdfDoc.end();

      const chunks = [];
      for await (const chunk of pdfDoc) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);

      return buffer;
    } catch (err) {
      throw err;
    }
  }
  async triggerCustomerJourney() {
    let emailLists: any = await this.enquiryRepo.getUnansweredEmailLists();
    emailLists = emailLists.map((item) =>
      item.assignedTo &&
      item.assignedTo.acceptedEmailCommunication &&
      item.assignedTo.email
        ? item.assignedTo.email
        : item.companyId &&
          item.companyId.userId &&
          item.companyId.userId.email &&
          item.companyId.userId.acceptedEmailCommunication
        ? item.companyId.userId.email
        : null,
    );
    emailLists = emailLists.filter(
      (value, index, returnArray) =>
        returnArray.indexOf(value) === index && value,
    );
    if (emailLists) {
      for (let i = 0; i < emailLists.length; i++) {
        await this.mailchimpService.triggerCustomerJourney(emailLists[i]);
      }
    }
    return { status: 'success' };
  }
  async getTotalEnquiryResponse(companyId) {
    companyId = new mongoose.Types.ObjectId(companyId);
    const total: any = [];
    const totalOutstandingCond = {
      $and: [
        { companyId: companyId },
        {
          $or: [{ assignedTo: { $exists: false } }],
        },
        {
          $or: [{ resolvedBy: { $exists: false } }],
        },
        {
          archivedBy: { $in: [null, undefined] },
        },
      ],
    };
    const totalOutstanding = await this.enquiryRepo.getTotalEnquiry(
      totalOutstandingCond,
    );
    total.totalOutstanding = totalOutstanding ? totalOutstanding : 0;
    const totalAssignedCond = {
      $and: [
        { companyId: companyId },
        { assignedTo: { $exists: true, $ne: null } },
        { resolvedBy: { $exists: false } },
        {
          archivedBy: { $in: [null, undefined] },
        },
      ],
    };
    const totalAssigned = await this.enquiryRepo.getTotalEnquiry(
      totalAssignedCond,
    );
    total.totalAssigned = totalAssigned ? totalAssigned : 0;

    const totalResolvedCond = {
      $and: [
        { companyId: companyId },
        { resolvedBy: { $exists: true, $ne: null } },
        {
          archivedBy: { $in: [null, undefined] },
        },
      ],
    };
    const totalResolved = await this.enquiryRepo.getTotalEnquiry(
      totalResolvedCond,
    );
    total.totalResolved = totalResolved ? totalResolved : 0;
    const totalUnreadCond = {
      $and: [
        { companyId: companyId },
        {
          $or: [
            { resolvedBy: { $exists: false } },
            { assignedTo: { $exists: false } },
          ],
        },
        { status: 'delivered' },
        {
          archivedBy: { $in: [null, undefined] },
        },
      ],
    };
    const totalUnread = await this.enquiryRepo.getTotalEnquiry(totalUnreadCond);
    total.totalUnread = totalUnread ? totalUnread : 0;
    const totalArchivedCond = {
      $and: [
        { companyId: companyId },
        {
          archivedBy: { $ne: null },
        },
        {
          archivedBy: { $ne: undefined },
        },
      ],
    };
    const totalArchived = await this.enquiryRepo.getTotalEnquiry(
      totalArchivedCond,
    );
    total.totalArchived = totalArchived ? totalArchived : 0;
    return total;
  }
}
