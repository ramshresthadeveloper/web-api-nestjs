import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Investor, InvestorDocument } from '../entities/investor.entity';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { InvestorRepository } from '../repository/investor.repository';
import { CompanyIdOnlyInput } from '../dto/input/companyId-only.input';
import { User } from '@src/user/entities/user.entity';
import { CompanyRepository } from '@src/company/repository/company.repository';
import Lang from '@src/constants/language';

@Injectable()
export class InvestorService {
  constructor(
    @InjectModel(Investor.name) private investorModel: Model<InvestorDocument>,
    private readonly investorRepo: InvestorRepository,
    private readonly companyRepo: CompanyRepository,
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

  async getTotalInterestedAndInvestedInvestor(
    user: User,
    companyIdOnlyInput: CompanyIdOnlyInput,
  ) {
    try {
      const { companyId } = companyIdOnlyInput;

      const company = await this.companyRepo.findOne({
        _id: companyId,
      });
      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.checkUserIsInCompany(user._id, companyId);

      const result =
        await this.investorRepo.getTotalInterestedAndInvestedInvestor(
          companyId,
        );

      return result;
    } catch (err) {
      throw err;
    }
  }
}
