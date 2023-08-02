import { CompanyViewsRepository } from '@src/company-views/repository/company-views.repository';
import { OnboardingChecklistService } from './../onboarding-checklist/service/onboarding-checklist.service';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateCompanyInput } from './dto/input/company.register.input';
import { CompanyRepository } from './repository/company.repository';
import { UserRepository } from '../user/repository/user.repository';
import Lang from '@src/constants/language';
import { Company, CompanyDocument } from './entity/company.entity';
import { RegisterCompanyResponse } from './dto/response/company.register.response';
import { AnnouncementService } from '@src/announcement/announcement.service';
import { TimeseriesService } from '@src/timeseries/timeseries.service';
import { UpdateCompanyInput } from './dto/input/update-company.input';
import { User, UserDocument } from '@src/user/entities/user.entity';
import { FileUpload } from 'graphql-upload';
import { S3BucketService } from '@src/s3-bucket/s3-bucket.service';
import { CompanyIdOnlyInput } from '@investor/dto/input/companyId-only.input';
import { TeamMemberListInput } from './dto/input/team-members-list.input';
import { AddTeamMemberDto } from './dto/input/add-team-member.input';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from '@src/mail/email.service';
import { TeamMemberDetailInputDto } from './dto/input/team-member-detail.input';
import { UpdateTeamMemberDetailDto } from './dto/input/team-member-detail-edit.input';
import { ActivityService } from '@activity/activity.service';
import { UpdateTeamMemberPermissionInput } from './dto/input/team-member-permission-edit.input';
import { MorningStarService } from '@src/morning-star/morning-star.service';
import { IdOnly } from '@announcement/dto/input/id-only.input';
import { TimeseriesRepository } from '@src/timeseries/repository/timeseries.repository';
import { AnnouncementRepository } from '@announcement/repository/announcement.repository';
import { EnquiryRepository } from '@enquiry/repository/enquiry.repository';

import { InvestorRepository } from '@investor/repository/investor.repository';
import { CompanyEventRepository } from '@src/event/repository/event.repository';
import { NotificationRepository } from '@notification/repository/notification.repository';
import { ExecutiveTeamRepository } from '@executive-team/repository/executive.team.repository';
import { ActivityRepository } from '@activity/repository/activity.repository';
import { FaqRepository } from '@faq/repositories/faq.repository';
import { FaqCategoryRepository } from '@faq/repositories/faq-category.repository';
import { ResponseTemplateService } from '@src/response-template/response-template.service';
import { Cron } from '@nestjs/schedule';
import { MailchimpService } from '@src/mailchimp/mailchimp.service';
import {
  InitialAddTeamMemberDto,
  InitialTeamMember,
} from './dto/input/initial-add-team-member.input';
import { TeamMemberRole } from '@src/constants/dbEnum';
import mongoose from 'mongoose';

@Injectable()
export class CompanyService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly userRepository: UserRepository,
    private readonly announcementService: AnnouncementService,
    private readonly timeseriesService: TimeseriesService,
    private readonly s3BucketService: S3BucketService,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    private readonly emailService: EmailService,
    private readonly activityService: ActivityService,
    private readonly morningStarService: MorningStarService,
    private readonly annoucementRepo: AnnouncementRepository,
    private readonly timeSeriesRepo: TimeseriesRepository,
    private readonly enquiryRepo: EnquiryRepository,
    private readonly investorRepo: InvestorRepository,
    private readonly companyEventRepo: CompanyEventRepository,
    private readonly notificationRepo: NotificationRepository,
    private readonly executiveTeamRepo: ExecutiveTeamRepository,
    private readonly activityRepo: ActivityRepository,
    private readonly faqRepo: FaqRepository,
    private readonly fapCategoryRepo: FaqCategoryRepository,
    private readonly responseTemplateService: ResponseTemplateService,
    private readonly mailchimpService: MailchimpService,
    private readonly onboardingChecklistService: OnboardingChecklistService,
    private readonly companyViewsRepository: CompanyViewsRepository,
  ) {}

  async checkUserIsInCompany(userId, companyId) {
    try {
      const company = await this.companyRepository.findOne(
        {
          _id: companyId,
        },
        { _id: 1 },
      );
      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      const userBelongsToCompany =
        await this.companyRepository.checkIfUserBelongsToCompany(
          userId,
          companyId,
        );

      if (!userBelongsToCompany) {
        throw new ForbiddenException();
      }
    } catch (err) {
      throw err;
    }
  }

  async isCompanyValidated(companyId) {
    try {
      const validated = await this.companyRepository.isCompanyValidated(
        companyId,
      );

      if (!validated) {
        throw new UnprocessableEntityException(Lang.COMPANY_NOT_VALIDATED);
      }
    } catch (err) {
      throw err;
    }
  }

  async registerCompany(
    createCompanyDto: CreateCompanyInput,
    userId,
  ): Promise<RegisterCompanyResponse> {
    try {
      const { legalBusinessName, asxCode } = createCompanyDto;
      let activateCron = false;
      const isRegistered = true;
      let existsCompany = await this.companyRepository.findOne({
        legalBusinessName,
      });

      if (existsCompany && existsCompany.isRegistered) {
        throw new ConflictException(Lang.BUSINESS_NAME_TAKEN);
      }

      if (!existsCompany && asxCode) {
        existsCompany = await this.companyRepository.findOne({ asxCode });
        if (!existsCompany) {
          throw new NotFoundException(Lang.INVALID_ASXCODE);
        }
      }

      if (existsCompany && existsCompany.isRegistered) {
        throw new ConflictException(Lang.BUSINESS_NAME_TAKEN);
      }
      if (existsCompany && asxCode) {
        activateCron = true;
      }

      const user = await this.userRepository.findOne({ _id: userId });
      if (!user) {
        throw new NotFoundException(Lang.USER_NOT_FOUND);
      }

      let locationData = {};
      if (createCompanyDto.longitude) {
        locationData = {
          coordinates: [createCompanyDto.longitude, createCompanyDto.latitude],
          type: 'Point',
        };
      }

      const newCompany = await this.companyRepository.createOrUpdate({
        ...existsCompany,
        ...createCompanyDto,
        userId,
        location: locationData,
        subscription: {
          status: 'inactive',
        },
        isRegistered,
        activateCron,
      });

      // Get Company Initial response template
      await this.responseTemplateService.saveInitialDefaultResponseTemplate(
        newCompany._id,
      );

      if (asxCode) {
        await this.morningStarService.populateMorningStarAPI(
          newCompany._id,
          asxCode,
          userId,
        );
      }

      return {
        company: newCompany,
      };
    } catch (err) {
      throw err;
    }
  }

  async getUserCompanyList(userId): Promise<Company[]> {
    try {
      const companies = await this.companyRepository.findMany(
        {
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
        {
          _id: 1,
          legalBusinessName: 1,
          companyLogo: 1,
        },
      );
      if (companies.length > 0) {
        await Promise.all(
          companies.map(async (data) => {
            if (data.companyLogo) {
              let url = await this.getSignedUrlFromKey(data.companyLogo);
              data.companyLogo = url;
            }
            return data;
          }),
        );
      }
      return companies;
    } catch (err) {
      throw err;
    }
  }

  async updateCompany(user: User, updateCompanyInput: UpdateCompanyInput) {
    try {
      const {
        companyId,
        legalBusinessName,
        companyLogo,
        email,
        optionalBusinessName,
        websiteUrl,
        addressLineOne,
        addressLineTwo,
        suburb,
        state,
        postCode,
        longitude,
        latitude,
        phoneNumber,
        about,
      } = updateCompanyInput;
      const { _id: userId } = user;

      // Function to check if userId of company is same as logged in user
      // only user whose id is in userId can update company with this check
      await this.checkUserIsInCompany(userId, companyId);
      await this.isCompanyValidated(companyId);

      const companyWithSameName = await this.companyRepository.findOne({
        legalBusinessName,
        _id: { $ne: companyId },
      });

      if (companyWithSameName) {
        throw new ConflictException(Lang.BUSINESS_NAME_TAKEN);
      }

      const updatedCompany =
        await this.companyRepository.findCompanyByIdAndUpdate(companyId, {
          legalBusinessName,
          companyLogo,
          email,
          optionalBusinessName,
          websiteUrl,
          addressLineOne,
          addressLineTwo,
          suburb,
          state,
          postCode,
          location: {
            coordinates: [longitude || 0, latitude || 0],
            type: 'Point',
          },
          phoneNumber,
          about,
        });

      if (!updatedCompany) {
        throw new NotFoundException('Company with given id not found');
      }

      this.activityService.createActivity({
        userId,
        companyId,
        isTeamMember: userId.toString() !== updatedCompany.userId.toString(),
        activityDescription: Lang.ACTIVITY_COMPANY_DETAIL_UPDATED,
        jobTitle: user.jobTitle,
      });

      // Update the onboarding checklist data
      const checklistData = {};
      if (about) {
        checklistData['addCompanyBio'] = true;
      }
      if (companyLogo) {
        checklistData['addCompanyLogo'] = true;
      }
      this.onboardingChecklistService.updateCompanyChecklistData(
        companyId,
        checklistData,
      );

      return updatedCompany;
    } catch (err) {
      throw err;
    }
  }

  async getCompanyDetail(user: User, company: CompanyIdOnlyInput) {
    try {
      const { companyId } = company;
      const { _id: userId, lastLoggedInAt: companyCreatorLastLoggedIn } = user;
      const companyWithTeam =
        await this.companyRepository.companyDetailWithTeamMember(companyId);
      if (!companyWithTeam) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }
      let permissions = {
        canCreateEvent: 1,
        canManageQuestion: 1,
        canInviteTeamMembers: 1,
        hasAdministrativeControl: 1,
      };
      let userExistsInCompany: Company = await this.companyRepository.findOne(
        {
          _id: companyId,
          userId,
        },
        { _id: 1 },
      );

      let companyData;
      if (!userExistsInCompany) {
        userExistsInCompany = await this.companyRepository.findOne(
          { 'teamMembers.userId': userId },
          { 'teamMembers.permissions.$': 1 },
        );

        if (!userExistsInCompany) {
          throw new UnauthorizedException();
        }
        companyData = Object.assign({ companyCreator: false }, companyWithTeam);
        userExistsInCompany.teamMembers[0].permissions.forEach((permission) => {
          if (permission.name == 'createEvent') {
            permissions.canCreateEvent = permission.allowed === true ? 1 : 0;
          } else if (permission.name == 'questionManagement') {
            permissions.canManageQuestion = permission.allowed === true ? 1 : 0;
          } else if (permission.name == 'inviteStaff') {
            permissions.canInviteTeamMembers =
              permission.allowed === true ? 1 : 0;
          } else if (permission.name == 'administrative') {
            permissions.hasAdministrativeControl =
              permission.allowed === true ? 1 : 0;
          }
        });
      } else {
        companyData = Object.assign({ companyCreator: true }, companyWithTeam);
      }
      companyData = Object.assign({ permissions }, companyData);
      companyData = Object.assign({ companyCreatorLastLoggedIn }, companyData);
      return companyData;
    } catch (err) {
      throw err;
    }
  }

  async getTeamMembers(user: User, teamMemberListInput: TeamMemberListInput) {
    try {
      const { companyId, page, limit, searchText } = teamMemberListInput;
      const { _id: userId } = user;

      // await this.checkUserIsInCompany(userId, companyId);
      // await this.isCompanyValidated(companyId);

      let result = await this.companyRepository.companyTeamMembers(
        companyId,
        page,
        limit,
        searchText,
      );
      if (result.items.length > 0) {
        await Promise.all(
          result.items.map(async (data) => {
            if (data.teamMember.profileImage) {
              let url = await this.getSignedUrlFromKey(
                data.teamMember.profileImage,
              );
              data.teamMember.profileImage = url;
            }
            return data;
          }),
        );
      }
      return result;
    } catch (err) {
      throw err;
    }
  }

  async getSignedUrlFromKey(key) {
    try {
      const result = await this.s3BucketService.getSignedUrl(key);
      return result;
    } catch (err) {
      throw err;
    }
  }

  async getTeamMembersWithQuestionPermission(
    teamMemberListInput: TeamMemberListInput,
  ) {
    try {
      const { companyId, searchText } = teamMemberListInput;

      const result =
        await this.companyRepository.companyTeamMembersWithQuestionPermission(
          companyId,
          searchText,
        );
      return result;
    } catch (err) {
      throw err;
    }
  }

  async getTeamMember(
    user: User,
    teamMemberDetailInput: TeamMemberDetailInputDto,
  ) {
    try {
      const { companyId, teamMemberId } = teamMemberDetailInput;
      const { _id: userId } = user;

      await this.companyRepository.canAddTeamMembers(userId, companyId);
      await this.isCompanyValidated(companyId);

      const teamMember = await this.companyRepository.teamMemberDetail(
        companyId,
        teamMemberId,
      );

      if (!teamMember.length) {
        throw new NotFoundException(Lang.STAFF_NOT_IN_TEAM);
      }

      return teamMember[0];
    } catch (err) {
      throw err;
    }
  }

  async addTeamMember(user: User, teamMemberInput: AddTeamMemberDto) {
    try {
      const { _id: userId } = user;
      const {
        companyId,
        firstName,
        lastName,
        email,
        mobileNum,
        canCreateEvent,
        canInviteTeamMembers,
        canManageQuestion,
        hasAdministrativeControl,
        jobTitle,
      } = teamMemberInput;

      const company = await this.companyRepository.canAddTeamMembers(
        userId,
        companyId,
      );

      if (!company) {
        throw new ForbiddenException(Lang.NOT_AUTHORIZED_TO_ADD_MEMEBERS);
      }
      await this.isCompanyValidated(companyId);

      const registeredUser = await this.userRepository.findOne(
        {
          email,
        },
        { _id: 1, email: 1 },
      );

      if (registeredUser) {
        if (registeredUser._id.toString() === company.userId.toString()) {
          throw new BadRequestException(
            'Cant invite the creator of current company as team member',
          );
        }
        if (company && company.teamMembers.length > 0) {
          const teamMemberAlreadyExists = company.teamMembers.some(
            (teamMember) =>
              teamMember.userId.toString() === registeredUser._id.toString(),
          );

          if (teamMemberAlreadyExists) {
            throw new BadRequestException('Team member is already added.');
          }
        }

        await this.companyModel.findOneAndUpdate(
          {
            _id: companyId,
            'teamMembers.userId': { $ne: registeredUser._id },
          },
          {
            $push: {
              teamMembers: {
                userId: registeredUser._id,
                jobTitle,
                permissions: [
                  { name: 'createEvent', allowed: canCreateEvent },
                  { name: 'questionManagement', allowed: canManageQuestion },
                  { name: 'inviteStaff', allowed: canInviteTeamMembers },
                  { name: 'administrative', allowed: hasAdministrativeControl },
                ],
              },
            },
          },
        );

        await this.emailService.sendInvitationMail(
          user,
          registeredUser,
          companyId,
          false,
          company.legalBusinessName,
        );

        return {
          message: 'Team Member added successfully',
        };
      }

      const newUser = await this.userRepository.create({
        firstName,
        lastName,
        mobileNum,
        email,
        jobTitle,
        acceptedTAndC: true,
        userName: `${firstName} ${lastName}`,
      });

      await this.companyModel.findOneAndUpdate(
        {
          _id: companyId,
          'teamMembers.userId': { $ne: newUser._id },
        },
        {
          $push: {
            teamMembers: {
              userId: newUser._id,
              jobTitle,
              permissions: [
                { name: 'createEvent', allowed: canCreateEvent },
                { name: 'questionManagement', allowed: canManageQuestion },
                { name: 'inviteStaff', allowed: canInviteTeamMembers },
                { name: 'administrative', allowed: hasAdministrativeControl },
              ],
            },
          },
        },
      );
      this.emailService.sendInvitationMail(
        user,
        newUser,
        companyId,
        true,
        company.legalBusinessName,
      );

      return {
        message: 'Team Member added successfully',
      };
    } catch (err) {
      throw err;
    }
  }

  async initialAddTeamMember(
    user: User,
    teamMemberInput: InitialAddTeamMemberDto,
  ) {
    try {
      const { _id: userId } = user;
      const { newTeamMembers, companyId } = teamMemberInput;
      const companyData = await this.companyRepository.isCompanyAdmin(
        userId,
        companyId,
      );
      //Check if the current user is superadmin or not
      if (!companyData) {
        throw new ForbiddenException(Lang.NO_ACCESS);
      }
      await this.isCompanyValidated(companyId);

      const emailsToBeAdded = newTeamMembers.map(
        (teamMember) => teamMember.email,
      );

      const userIds = await this.userRepository.getUserIdsFromEmails(
        emailsToBeAdded,
      );

      userIds.forEach((data) => {
        if (data == userId.toString()) {
          throw new ForbiddenException(Lang.CANNOT_ENTER_OWN_EMAIL);
        }
      });

      companyData.teamMembers.forEach((teamMember) => {
        if (userIds.includes(teamMember.userId.toString())) {
          throw new BadRequestException('Team member is already added.');
        }
      });

      newTeamMembers.forEach(async (teamMember) => {
        const { email, role } = teamMember;

        const permissionAllowed = role == TeamMemberRole.viewer ? false : true;
        const userPermissions = [
          {
            name: 'createEvent',
            allowed: permissionAllowed,
          },
          { name: 'questionManagement', allowed: permissionAllowed },
          { name: 'inviteStaff', allowed: permissionAllowed },
          {
            name: 'administrative',
            allowed: permissionAllowed,
          },
        ];

        const registeredUser = await this.userRepository.findOne(
          {
            email,
          },
          { _id: 1, email: 1 },
        );

        if (registeredUser) {
          await this.companyModel.findOneAndUpdate(
            {
              _id: companyId,
              'teamMembers.userId': { $ne: registeredUser._id },
            },
            {
              $push: {
                teamMembers: {
                  userId: registeredUser._id,
                  permissions: userPermissions,
                },
              },
              $set: { isInviteTeamSkipped: true },
            },
          );

          this.emailService.sendInvitationMail(
            user,
            registeredUser,
            companyId,
            false,
            companyData.legalBusinessName,
          );
        } else {
          const newUser = await this.userRepository.create({
            email,
            acceptedTAndC: true,
          });

          await this.companyModel.findOneAndUpdate(
            {
              _id: companyId,
              'teamMembers.userId': { $ne: newUser._id },
            },
            {
              $push: {
                teamMembers: {
                  userId: newUser._id,
                  permissions: userPermissions,
                },
              },
            },
          );
          this.emailService.sendInvitationMail(
            user,
            newUser,
            companyId,
            true,
            companyData.legalBusinessName,
          );
        }
      });
      return {
        message: 'Team Member added successfully',
      };
    } catch (err) {
      throw err;
    }
  }

  async updateTeamMemberDetail(
    user: User,
    teamMemberInput: UpdateTeamMemberDetailDto,
  ) {
    try {
      const {
        companyId,
        teamMemberId,
        jobTitle,
        firstName,
        lastName,
        mobileNum,
        profileImage,
      } = teamMemberInput;
      const { _id: userId } = user;

      const canModifyMemebers =
        await this.companyRepository.canModifyTeamMembers(userId, companyId);
      if (!canModifyMemebers) {
        throw new ForbiddenException(Lang.NOT_AUTHORIZED_TO_UPDATE_MEMEBERS);
      }
      await this.isCompanyValidated(companyId);

      const updatedCompany =
        await this.companyRepository.updateTeamMemberDetailCompany(
          companyId,
          teamMemberId,
          { jobTitle },
        );
      const updatedUser = await this.userRepository.updateTeamMemberDetailUser(
        teamMemberId,
        { firstName, lastName, mobileNum, profileImage, jobTitle },
      );

      if (!updatedCompany) {
        throw new NotFoundException(Lang.STAFF_NOT_IN_TEAM);
      }

      return {
        message: Lang.TEAM_MEMBER_DETAIL_UPDATE_SUCCESS,
      };
    } catch (err) {
      throw err;
    }
  }

  async deleteTeamMember(
    user: User,
    teamMemberInput: TeamMemberDetailInputDto,
  ) {
    try {
      const { companyId, teamMemberId } = teamMemberInput;
      const { _id: userId } = user;

      const canModifyMemebers =
        await this.companyRepository.canModifyTeamMembers(userId, companyId);
      if (!canModifyMemebers) {
        throw new ForbiddenException(Lang.NOT_AUTHORIZED_TO_DELETE_MEMEBERS);
      }
      const teamDetails = await this.userRepository.findOne({
        _id: Object(teamMemberId),
      });
      await this.isCompanyValidated(companyId);

      const deletedMember = await this.companyRepository.removeTeamMember(
        companyId,
        teamMemberId,
      );
      await this.enquiryRepo.findByAssignedToAndUpdate(teamMemberId);

      if (!deletedMember) {
        throw new NotFoundException(Lang.STAFF_NOT_IN_TEAM);
      }

      return {
        message: Lang.TEAM_MEMBER_DELETE_SUCCESS,
      };
    } catch (err) {
      throw err;
    }
  }

  async updateTeamMemberPermissions(
    user: User,
    teamMemberPermissionsInput: UpdateTeamMemberPermissionInput,
  ) {
    try {
      const {
        companyId,
        teamMemberId,
        canCreateEvent,
        canInviteTeamMembers,
        canManageQuestion,
        hasAdministrativeControl,
      } = teamMemberPermissionsInput;
      const { _id: userId } = user;

      const canModifyMemebers =
        await this.companyRepository.canModifyTeamMembers(userId, companyId);
      if (!canModifyMemebers) {
        throw new ForbiddenException(Lang.NOT_AUTHORIZED_TO_UPDATE_MEMEBERS);
      }
      await this.isCompanyValidated(companyId);

      const updatedCompany =
        await this.companyRepository.updateTeamMemberPermissions(
          companyId,
          teamMemberId,
          [
            { name: 'createEvent', allowed: canCreateEvent },
            { name: 'questionManagement', allowed: canManageQuestion },
            { name: 'inviteStaff', allowed: canInviteTeamMembers },
            { name: 'administrative', allowed: hasAdministrativeControl },
          ],
        );

      if (!updatedCompany) {
        throw new NotFoundException(Lang.STAFF_NOT_IN_TEAM);
      }

      return {
        message: Lang.TEAM_MEMBER_PERMISSIONS_UPDATE_SUCCESS,
      };
    } catch (err) {
      throw err;
    }
  }

  async removeCompany(user: UserDocument, removeCompanyInput: IdOnly) {
    try {
      const { _id: userId } = user;
      const { id: companyId } = removeCompanyInput;

      const company = await this.companyModel.findById(companyId);

      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      if (userId.toString() !== company.userId.toString()) {
        throw new ForbiddenException(Lang.DELETE_COMPANY_FORBIDDEN);
      }

      await this.annoucementRepo.bulkDelete({
        companyId,
      });

      await this.timeSeriesRepo.bulkDelete({
        companyId,
      });

      await this.enquiryRepo.deleteCompanyEnquiries(companyId);

      await this.investorRepo.removeCompanyWhenDeleted(companyId);

      await this.notificationRepo.bulkDelete({
        companyId,
      });

      await this.companyEventRepo.bulkDelete({
        companyId,
      });

      await this.activityRepo.bulkDelete({
        companyId,
      });

      await this.faqRepo.bulkDelete({
        companyId,
      });

      await this.fapCategoryRepo.bulkDelete({
        companyId,
      });

      await this.executiveTeamRepo.bulkDelete({
        companyId,
      });

      // remove company's views data
      await this.companyViewsRepository.bulkDelete({
        companyId: new mongoose.Types.ObjectId(companyId),
      });

      // removing stripe details from user on company removal
      await this.userRepository.removeStripeDetails(user);

      const companyMembers =
        await this.companyRepository.companyTeamMembersSimple(companyId);

      companyMembers.forEach((member) => {
        this.emailService.sendCompanyDeletedEmail(member);
      });

      await this.companyModel.findByIdAndDelete(companyId);

      return {
        message: 'Company removed successfully',
      };
    } catch (err) {
      throw err;
    }
  }

  async uploadFile(file: FileUpload) {
    try {
      const { createReadStream } = file;

      const stream = createReadStream();
      const chunks = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);

      const fileFromAws = await this.s3BucketService.uploadFileBuffer(
        buffer,
        file.mimetype,
        'company-logo',
      );

      return {
        key: fileFromAws.Key,
      };
    } catch (err) {
      throw err;
    }
  }

  async getUserCompanyListWithCreatorFlag(userId) {
    try {
      const companies =
        await this.companyRepository.getAllCompaniesUserIsMemberOfWithCreatorFlag(
          userId,
        );
      if (companies.length > 0) {
        await Promise.all(
          companies.map(async (data) => {
            if (data.companyLogo) {
              const url = await this.getSignedUrlFromKey(data.companyLogo);
              data.companyLogo = url;
            }
            return data;
          }),
        );
      }
      return companies;
    } catch (err) {
      throw err;
    }
  }

  async addTeamName(teamNameInput) {
    try {
      const { teamName, companyId } = teamNameInput;
      return await this.companyRepository.addTeamName(teamName, companyId);
    } catch (err) {
      throw err;
    }
  }

  async getTeamName(companyId) {
    try {
      return await this.companyRepository.getTeamName(companyId);
    } catch (err) {
      throw err;
    }
  }

  async getSubscription(companyId) {
    try {
      return await this.companyRepository.getSubscription(companyId);
    } catch (err) {
      throw err;
    }
  }

  async skipInviteTeam(companyId) {
    await this.companyRepository.findCompanyByIdAndUpdate(companyId, {
      $set: { isInviteTeamSkipped: true },
    });
    return { message: 'Team invitation skipped.' };
  }

  // Cron for company subscriptions status update at 12:15am daily
  @Cron('15 0 * * *')
  async updateAllTrialStatus() {
    await this.companyRepository.updateAllTrialStatus();
  }
}
