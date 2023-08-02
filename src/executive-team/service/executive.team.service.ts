import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

import Lang from '@src/constants/language';
import { AddExecutiveMemberInput } from '@executive-team/dto/input/add.executive.member.input';
import { CompanyIdInput } from '@executive-team/dto/input/company.input.id';
import { CompanyRepository } from '@company/repository/company.repository';
import { EditExecutiveMemberInput } from '@executive-team/dto/input/edit.executive.member.input';
import { ExecutiveMemberIdInput } from '@executive-team/dto/input/executive.member.id.input';
import { ExecutiveTeamRepository } from '@executive-team/repository/executive.team.repository';
import { FileUpload } from 'graphql-upload';

import { UserDocument } from '@user/entities/user.entity';
import { S3BucketService } from '@src/s3-bucket/s3-bucket.service';
import { OnboardingChecklistService } from '@src/onboarding-checklist/service/onboarding-checklist.service';

@Injectable()
export class ExecutiveTeamService {
  constructor(
    private readonly executiveTeamRepository: ExecutiveTeamRepository,
    private readonly s3BucketService: S3BucketService,
    private readonly companyRepository: CompanyRepository,
    private readonly onboardingChecklistService: OnboardingChecklistService,
  ) {}

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

  async addExecutiveMember(
    addExecutiveMemberInput: AddExecutiveMemberInput,
    { _id: userId }: UserDocument,
  ) {
    const company = await this.companyRepository.hasAdministrativePermission(
      addExecutiveMemberInput.companyId,
      userId,
    );

    if (!company) {
      throw new ForbiddenException(Lang.NO_ADMINISTRATIVE_PERMISSION);
    }
    await this.isCompanyValidated(company._id);

    const executiveData =
      await this.executiveTeamRepository.createExecutiveMember(
        addExecutiveMemberInput,
      );
    // Update the onboarding checklist data
    const checklistData = {};
    if (executiveData) {
      checklistData['addExecutive'] = true;
    }
    this.onboardingChecklistService.updateCompanyChecklistData(
      addExecutiveMemberInput.companyId,
      checklistData,
    );
    return executiveData;
  }

  async getExecutiveMembers(
    { companyId }: CompanyIdInput,
    { _id: userId }: UserDocument,
  ) {
    const company = await this.companyRepository.checkIfUserBelongsToCompany(
      userId,
      companyId,
    );

    if (!company) {
      throw new ForbiddenException(Lang.NO_READ_PERMISSION);
    }
    await this.isCompanyValidated(companyId);

    return await this.executiveTeamRepository.getExecutiveMembers(companyId);
  }

  async deleteExecutiveMember(
    { memberId }: ExecutiveMemberIdInput,
    { _id: userId }: UserDocument,
  ) {
    const executiveMember = await this.executiveTeamRepository.findById(
      memberId,
    );

    if (!executiveMember) {
      throw new NotFoundException(Lang.EXECUTIVE_MEMBER_NOT_FOUND);
    }

    const company = await this.companyRepository.hasAdministrativePermission(
      executiveMember.companyId,
      userId,
    );

    if (!company) {
      throw new ForbiddenException(Lang.NO_ADMINISTRATIVE_PERMISSION);
    }
    await this.isCompanyValidated(company._id);

    await this.executiveTeamRepository.deleteExecutiveMember(memberId);

    return { status: Lang.EXECUTIVE_MEMBER_DELETED };
  }

  async editExecutiveMember(
    editExecutiveMemberInput: EditExecutiveMemberInput,
    { _id: userId }: UserDocument,
  ) {
    const executiveMember = await this.executiveTeamRepository.findById(
      editExecutiveMemberInput.memberId,
    );

    if (!executiveMember) {
      throw new NotFoundException(Lang.EXECUTIVE_MEMBER_NOT_FOUND);
    }

    const company = await this.companyRepository.hasAdministrativePermission(
      executiveMember.companyId,
      userId,
    );

    if (!company) {
      throw new ForbiddenException(Lang.NO_ADMINISTRATIVE_PERMISSION);
    }
    await this.isCompanyValidated(company._id);

    return await this.executiveTeamRepository.editExecutiveMember(
      editExecutiveMemberInput,
    );
  }

  async uploadFile(file: FileUpload) {
    try {
      const { createReadStream, mimetype } = file;

      const stream = createReadStream();
      const chunks = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);

      const fileFromAws = await this.s3BucketService.uploadFileBuffer(
        buffer,
        mimetype,
        'executive-team',
      );

      return { key: fileFromAws.Key };
    } catch (error) {
      throw error;
    }
  }
}
