import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from '../entity/company.entity';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';

@Injectable()
export class CompanyRepository extends BaseRepository {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  ) {
    super(companyModel);
  }
  async createOrUpdate(data): Promise<Company> {
    if (data._id) {
      return await this.findCompanyByIdAndUpdate(data._id, data);
    }
    return await this.create(data);
  }
  async create(createCompanyDto): Promise<Company> {
    return await this.companyModel.create(createCompanyDto);
  }

  async findOne(condition, select = null) {
    const result = this.companyModel.findOne(condition).lean();
    if (select) {
      result.select(select);
    }
    return result.exec();
  }

  async findMany(condition, select = null) {
    const result = this.companyModel.find(condition).lean();
    if (select) {
      result.select(select);
    }
    return result.exec();
  }

  async checkIfUserBelongsToCompany(userId, companyId): Promise<Company> {
    try {
      return await this.companyModel
        .findOne(
          {
            _id: companyId,
            $or: [{ userId: userId }, { 'teamMembers.userId': userId }],
          },
          { _id: 1, userId: 1 },
        )
        .lean();
    } catch (err) {
      throw err;
    }
  }

  async hasAdministrativePermission(
    companyId: string,
    userId: string,
  ): Promise<CompanyDocument> {
    return await this.companyModel.findOne({
      _id: companyId,
      $or: [
        { userId: userId },
        {
          teamMembers: {
            $elemMatch: {
              userId,
              permissions: {
                $elemMatch: { name: 'administrative', allowed: true },
              },
            },
          },
        },
      ],
    });
  }

  async checkUserIsTeamMember(userId, companyId): Promise<Company> {
    try {
      return await this.companyModel.findOne({
        _id: companyId,
        $or: [
          { userId: userId },
          {
            $and: [
              { 'teamMembers.userId': userId },
              // { 'teamMembers.invitationAccepted': true },
            ],
          },
        ],
      });
    } catch (err) {
      throw err;
    }
  }

  async findCompanyByIdAndUpdate(companyId, dataToUpdate) {
    try {
      return await this.companyModel.findByIdAndUpdate(
        companyId,
        dataToUpdate,
        { new: true },
      );
    } catch (err) {
      throw err;
    }
  }

  async updateOne(condition, data) {
    return await this.companyModel.findOneAndUpdate(condition, data, {
      new: true,
    });
  }

  async hasCreateEventPermission(userId, companyId): Promise<Company> {
    return await this.companyModel.findOne({
      _id: companyId,
      $or: [
        { userId: userId },
        {
          teamMembers: {
            $elemMatch: {
              userId,
              permissions: {
                $elemMatch: { name: 'createEvent', allowed: true },
              },
            },
          },
        },
        {
          teamMembers: {
            $elemMatch: {
              userId,
              permissions: {
                $elemMatch: { name: 'administrative', allowed: true },
              },
            },
          },
        },
      ],
    });
  }

  async companyTeamMembersWithQuestionPermission(companyId, searchText) {
    let stages = [];
    stages.push({
      $match: {
        _id: new mongoose.Types.ObjectId(companyId),
      },
    });
    stages.push({
      $addFields: {
        teamMembers: {
          $concatArrays: [
            '$teamMembers',
            [{ userId: '$userId', companyCreator: true }],
          ],
        },
      },
    });
    stages.push({
      $unwind: {
        path: '$teamMembers',
      },
    });

    stages.push({
      $match: {
        $or: [
          {
            'teamMembers.permissions': {
              $elemMatch: { name: 'questionManagement', allowed: true },
            },
          },
          {
            'teamMembers.permissions': {
              $elemMatch: { name: 'administrative', allowed: true },
            },
          },
          {
            'teamMembers.companyCreator': true,
          },
        ],
      },
    });

    stages.push({
      $project: {
        _id: 0,
        companyId: '$_id',
        userId: '$teamMembers.userId',
        companyCreator: '$teamMembers.companyCreator',
      },
    });

    stages.push({
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userData',
      },
    });

    stages.push({
      $addFields: { userData: { $first: '$userData' } },
    });

    stages.push({
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ['$userData', '$$ROOT'],
        },
      },
    });

    stages.push({
      $project: {
        companyId: 0,
        userId: 0,
        userData: 0,
      },
    });

    if (searchText != null) {
      const rgx = (pattern) => new RegExp(`.*${pattern}.*`);
      const searchRgx = rgx(searchText);
      stages.push({
        $match: {
          firstName: { $regex: searchRgx, $options: 'i' },
        },
      });
    }

    return await this.companyModel.aggregate(stages);
  }

  isCompanyAdmin(userId: string, companyId: string) {
    return this.companyModel.findOne(
      {
        _id: companyId,
        userId: userId,
      },
      {
        legalBusinessName: 1,
        teamMembers: 1,
        userId: 1,
      },
    );
  }

  async questionMgmtPermission(userId, companyId): Promise<Company> {
    return await this.companyModel.findOne({
      _id: companyId,
      $or: [
        { userId: userId },
        {
          teamMembers: {
            $elemMatch: {
              userId,
              permissions: {
                $elemMatch: { name: 'questionManagement', allowed: true },
              },
            },
          },
        },
        {
          teamMembers: {
            $elemMatch: {
              userId,
              permissions: {
                $elemMatch: { name: 'administrative', allowed: true },
              },
            },
          },
        },
      ],
    });
  }

  async companyDetailWithTeamMember(companyId) {
    const company = await this.companyModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(companyId),
        },
      },
      {
        $unwind: {
          path: '$teamMembers',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'teamMembers.userId',
          foreignField: '_id',
          as: 'teamMembers.user',
        },
      },
      {
        $unwind: {
          path: '$teamMembers.user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$_id',
          userId: { $first: '$userId' },
          email: { $first: '$email' },
          phoneNumber: { $first: '$phoneNumber' },
          companyLogo: { $first: '$companyLogo' },
          legalBusinessName: { $first: '$legalBusinessName' },
          addressLineOne: { $first: '$addressLineOne' },
          addressLineTwo: { $first: '$addressLineTwo' },
          suburb: { $first: '$suburb' },
          state: { $first: '$state' },
          postCode: { $first: '$postCode' },
          websiteUrl: { $first: '$websiteUrl' },
          about: { $first: '$about' },
          abn: { $first: '$abn' },
          optionalBusinessName: { $first: '$optionalBusinessName' },
          acn: { $first: '$acn' },
          asxCode: { $first: '$asxCode' },
          disabled: { $first: '$disabled' },
          permId: { $first: '$permId' },
          validated: { $first: '$validated' },
          location: { $first: '$location' },
          teamName: { $first: '$teamName' },
          subscription: { $first: '$subscription' },
          teamMembers: {
            $push: '$teamMembers',
          },
          isInviteTeamSkipped: { $first: '$isInviteTeamSkipped' },
        },
      },
    ]);

    return company[0];
  }

  async companyDetailWithTeamMemberSimple(companyId) {
    const company = await this.companyModel
      .findOne({ _id: companyId }, { teamMembers: 1, userId: 1 })
      .lean();

    return company;
  }

  async companyTeamMembers(
    companyId,
    page: number,
    limit: number,
    searchText = null,
  ) {
    let stages = [];
    stages.push({
      $match: {
        _id: new mongoose.Types.ObjectId(companyId),
      },
    });
    stages.push({
      $addFields: {
        teamMembers: {
          $concatArrays: [
            '$teamMembers',
            [{ userId: '$userId', companyCreator: true }],
          ],
        },
      },
    });
    stages.push({
      $unwind: {
        path: '$teamMembers',
      },
    });
    stages.push({
      $lookup: {
        from: 'users',
        localField: 'teamMembers.userId',
        foreignField: '_id',
        as: 'teamMembers.user',
      },
    });
    stages.push({
      $unwind: {
        path: '$teamMembers.user',
      },
    });
    if (searchText != null) {
      stages.push({
        $addFields: { userFirstName: '$teamMembers.user.firstName' },
      });
      const rgx = (pattern) => new RegExp(`.*${pattern}.*`);
      const searchRgx = rgx(searchText);
      stages.push({
        $match: {
          userFirstName: { $regex: searchRgx, $options: 'i' },
        },
      });
    }
    stages.push({
      $project: {
        companyId: '$_id',
        teamMember: '$teamMembers.user',
        permissions: '$teamMembers.permissions',
        jobTitleInCompany: '$teamMembers.jobTitle',
        companyCreator: '$teamMembers.companyCreator',
        teamMemberId: '$teamMembers._id',
        userFirstName: 1,
      },
    });

    return await this.aggregatePaginate(stages, { page, limit });
  }

  async teamMemberDetail(companyId, teamMemberId) {
    let stages = [];
    stages.push({
      $match: {
        _id: new mongoose.Types.ObjectId(companyId),
      },
    });
    stages.push({
      $unwind: {
        path: '$teamMembers',
      },
    });
    stages.push({
      $lookup: {
        from: 'users',
        localField: 'teamMembers.userId',
        foreignField: '_id',
        as: 'teamMembers.user',
      },
    });
    stages.push({
      $unwind: {
        path: '$teamMembers.user',
      },
    });
    stages.push({
      $addFields: { teamMemberId: '$teamMembers.user._id' },
    });
    stages.push({
      $match: {
        teamMemberId: new mongoose.Types.ObjectId(teamMemberId),
      },
    });
    stages.push({
      $project: {
        companyId: '$_id',
        teamMember: '$teamMembers.user',
        permissions: '$teamMembers.permissions',
        jobTitleInCompany: '$teamMembers.jobTitle',
        teamMemberId: '$teamMembers._id',
      },
    });
    return await this.companyModel.aggregate(stages);
  }

  async teamMemberDetailWithUserId(companyId, userId) {
    return await this.companyModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(companyId),
        },
      },
      {
        $unwind: {
          path: '$teamMembers',
        },
      },
      {
        $match: {
          'teamMembers.userId': new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'teamMembers.userId',
          foreignField: '_id',
          as: 'teamMembers.user',
        },
      },
      {
        $unwind: {
          path: '$teamMembers.user',
        },
      },
      {
        $project: {
          companyId: '$_id',
          teamMember: '$teamMembers.user',
          permissions: '$teamMembers.permissions',
          jobTitleInCompany: '$teamMembers.jobTitle',
          teamMemberId: '$teamMembers._id',
          teamMemberUserId: '$teamMembers.userId',
        },
      },
    ]);
  }

  async canAddTeamMembers(userId, companyId): Promise<Company> {
    return await this.companyModel.findOne(
      {
        _id: companyId,
        $or: [
          { userId: userId },
          {
            teamMembers: {
              $elemMatch: {
                userId,
                permissions: {
                  $elemMatch: { name: 'inviteStaff', allowed: true },
                },
              },
            },
          },
          {
            teamMembers: {
              $elemMatch: {
                userId,
                permissions: {
                  $elemMatch: { name: 'administrative', allowed: true },
                },
              },
            },
          },
        ],
      },
      {
        legalBusinessName: 1,
        teamMembers: 1,
        userId: 1,
      },
    );
  }

  async updateTeamMemberDetailCompany(companyId, teamMemberId, dataToUpdate) {
    const { jobTitle } = dataToUpdate;
    return await this.companyModel.findOneAndUpdate(
      {
        _id: companyId,
        'teamMembers.userId': teamMemberId,
      },
      { $set: { 'teamMembers.$.jobTitle': jobTitle } },
      { new: true },
    );
  }

  async updateTeamMemberPermissions(companyId, teamMemberId, permissionsArray) {
    return await this.companyModel.findOneAndUpdate(
      {
        _id: companyId,
        'teamMembers.userId': teamMemberId,
      },
      { $set: { 'teamMembers.$.permissions': permissionsArray } },
      { new: true },
    );
  }

  async removeTeamMember(companyId, teamMemberId) {
    return await this.companyModel.findOneAndUpdate(
      { _id: companyId, 'teamMembers.$._id': teamMemberId },
      {
        $pull: {
          teamMembers: {
            userId: teamMemberId,
          },
        },
      },
      { new: true },
    );
  }

  async canModifyTeamMembers(userId, companyId): Promise<Company> {
    return await this.companyModel.findOne({
      _id: companyId,
      $or: [
        { userId: userId },
        {
          teamMembers: {
            $elemMatch: {
              userId,
              permissions: {
                $elemMatch: { name: 'administrative', allowed: true },
              },
            },
          },
        },
      ],
    });
  }

  async isCompanyValidated(companyId): Promise<boolean> {
    const company = await this.companyModel
      .findOne({ _id: companyId }, { _id: 1, validated: 1 })
      .lean();
    if (!company || !company.validated) {
      return false;
    }
    return true;
  }

  async getAllCompaniesUserIsMemberOfWithCreatorFlag(userId) {
    return await this.companyModel.aggregate([
      {
        $match: {
          $or: [
            { userId: userId },
            {
              $and: [
                { 'teamMembers.userId': userId },
                { 'teamMembers.invitationAccepted': true },
              ],
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          legalBusinessName: 1,
          companyLogo: 1,
          userId: 1,
          hasCreatedCompany: {
            $cond: [{ $and: [{ $eq: ['$userId', userId] }] }, true, false],
          },
        },
      },
    ]);
  }

  async addTeamName(teamName, companyId) {
    return await this.companyModel.findOneAndUpdate(
      { _id: companyId },
      {
        $set: { teamName },
      },
      { new: true },
    );
  }

  async getTeamName(companyId) {
    return await this.companyModel
      .findOne({ _id: companyId }, { _id: 1, teamName: 1 })
      .lean();
  }

  async getSubscription(companyId) {
    const data = await this.companyModel
      .findOne({ _id: companyId }, { _id: 1, subscription: 1 })
      .lean();
    return data.subscription;
  }

  async companyTeamMembersSimple(companyId) {
    let stages = [];
    stages.push({
      $match: {
        _id: new mongoose.Types.ObjectId(companyId),
      },
    });
    stages.push({
      $unwind: {
        path: '$teamMembers',
      },
    });
    stages.push({
      $lookup: {
        from: 'users',
        localField: 'teamMembers.userId',
        foreignField: '_id',
        as: 'teamMembers.user',
      },
    });
    stages.push({
      $unwind: {
        path: '$teamMembers.user',
      },
    });
    stages.push({
      $project: {
        companyId: '$_id',
        legalBusinessName: 1,
        userId: '$teamMembers.user._id',
        userName: '$teamMembers.user.userName',
        email: '$teamMembers.user.email',
      },
    });
    return await this.companyModel.aggregate(stages);
  }

  async getCompanyTeammemberIdWithJobtitle(companyId) {
    return await this.companyModel.findById(companyId, {
      'teamMembers.userId': 1,
      'teamMembers.jobTitle': 1,
      userId: 1,
    });
  }

  async updateAllTrialStatus() {
    var expireDate = new Date();
    var expireNextDayDate = new Date();
    expireNextDayDate.setDate(expireNextDayDate.getDate() + 1);

    return await this.companyModel.updateMany(
      {
        'subscription.endDate': { $gte: expireDate, $lt: expireNextDayDate },
        'subscription.stripeCustomerId': { $exists: false },
      },
      { 'subscription.status': 'inactive' },
    );
  }

  async resetUnseenMonthlyQuestionPromptCount(
    companyId: string,
    userId: string,
  ) {
    await this.companyModel.updateOne(
      { _id: companyId },
      { $set: { 'unseenMonthlyQuestionPromptCount.$[elem].count': 0 } },
      { arrayFilters: [{ 'elem.userId': userId }] },
    );
  }

  async getUnseenMonthlyQuestionCount(companyId: string, userId: string) {
    return await this.companyModel
      .findOne({
        _id: companyId,
        unseenMonthlyQuestionPromptCount: {
          $elemMatch: {
            userId: userId,
          },
        },
      })
      .select('unseenMonthlyQuestionPromptCount.$');
  }
}
