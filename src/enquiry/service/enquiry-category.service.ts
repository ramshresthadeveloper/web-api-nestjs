import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import * as mongoose from 'mongoose';

import { CreateEnquiryCategoryInput } from '../dto/input/enquiry-category.input';
import { CompanyRepository } from '@src/company/repository/company.repository';
import Lang from '@src/constants/language';
import { User } from '@src/user/entities/user.entity';
import { EnquiryCategoryRepository } from '../repository/enquiry-category.repository';
import { EnquiryCategoryListInput } from '../dto/input/enquiry-category-list.input';
import { EditEnquiryCategory } from '@enquiry/dto/input/enquiry-category-update.input';
import { EnquiryCategoryDeleteInput } from '@enquiry/dto/input/enquiry-category-delete.input';
import { EnquiryRepository } from '@enquiry/repository/enquiry.repository';

@Injectable()
export class EnquiryCategoryService {
  constructor(
    private readonly companyRepo: CompanyRepository,
    private readonly enquiryCategoryRepo: EnquiryCategoryRepository,
    private readonly enquiryRepo: EnquiryRepository,
  ) {}

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

  async createEnquiryCategory(
    user: User,
    enquiryCategoryInput: CreateEnquiryCategoryInput,
  ) {
    try {
      const { companyId, name } = enquiryCategoryInput;

      const company = await this.companyRepo.findOne({
        _id: companyId,
      });
      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.canManageEnquries(user._id, companyId);
      await this.isCompanyValidated(companyId);

      return await this.enquiryCategoryRepo.create({
        name,
        companyId,
        createdBy: user._id,
      });
    } catch (err) {
      throw err;
    }
  }

  async updateEnquiryCategory(
    user: User,
    enquiryCategoryInput: EditEnquiryCategory,
  ) {
    try {
      const { companyId, name, enquiryCategoryId } = enquiryCategoryInput;

      const company = await this.companyRepo.findOne({
        _id: companyId,
      });
      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.canManageEnquries(user._id, companyId);
      await this.isCompanyValidated(companyId);

      const updatedEnquiryCategory =
        await this.enquiryCategoryRepo.findByIdAndUpdate(enquiryCategoryId, {
          name,
        });

      if (!updatedEnquiryCategory) {
        throw new NotFoundException(Lang.ENQUIRY_CATEGORY_NOT_FOUND);
      }

      return updatedEnquiryCategory;
    } catch (err) {
      throw err;
    }
  }

  async deleteEnquiryCategory(
    user: User,
    enquiryCategory: EnquiryCategoryDeleteInput,
  ) {
    try {
      const { companyId, enquiryCategoryId } = enquiryCategory;
      const { _id: userId } = user;

      const company = await this.companyRepo.findOne({
        _id: companyId,
      });
      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.canManageEnquries(userId, companyId);
      await this.isCompanyValidated(companyId);
      
      const updateEnquiryCategory =
        await this.enquiryRepo.findByEnquiryCategoryIdAndUpdate(enquiryCategoryId);
      const deletedEnquiryCategory =
        await this.enquiryCategoryRepo.findByIdAndDelete(enquiryCategoryId);

      if (!deletedEnquiryCategory) {
        throw new NotFoundException(Lang.ENQUIRY_CATEGORY_NOT_FOUND);
      }

      return deletedEnquiryCategory;
    } catch (err) {
      throw err;
    }
  }

  async getEnquiryCategories(
    user: User,
    enquiryCategoryListInput: EnquiryCategoryListInput,
  ) {
    try {
      const { companyId, searchText, page, limit } = enquiryCategoryListInput;

      const company = await this.companyRepo.findOne({
        _id: companyId,
      });

      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.checkUserIsInCompany(user._id, companyId);
      await this.isCompanyValidated(companyId);

      const stages = [
        {
          $match: {
            companyId: new mongoose.Types.ObjectId(companyId),
            name: { $regex: searchText, $options: 'i' },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ];

      const paginatedResult = await this.enquiryCategoryRepo.aggregatePaginate(
        stages,
        {
          page,
          limit,
        },
      );

      return paginatedResult;
    } catch (err) {
      throw err;
    }
  }
}
