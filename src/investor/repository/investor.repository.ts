import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Investor, InvestorDocument } from '../entities/investor.entity';
import { BaseRepository } from './base.repository';
import { Model } from 'mongoose';

@Injectable()
export class InvestorRepository extends BaseRepository {
  constructor(
    @InjectModel(Investor.name) private investorModel: Model<InvestorDocument>,
  ) {
    super(investorModel);
  }

  async getTotalInterestedAndInvestedInvestor(companyId) {
    try {
      const totalInterestedInvestor = await this.investorModel
        .find({
          interestedCompanies: {
            $in: [companyId],
          },
        })
        .count();

      const totalInvestedInvestor = await this.investorModel
        .find({
          investedCompanies: {
            $in: [companyId],
          },
        })
        .count();

      return {
        totalInterestedInvestor,
        totalInvestedInvestor,
      };
    } catch (err) {
      throw err;
    }
  }

  async removeCompanyWhenDeleted(companyId) {
    try {
      return await this.investorModel.updateMany(
        {},
        {
          $pull: {
            investedCompanies: companyId,
            interestedCompanies: companyId,
            companyList: { _id: companyId },
          },
        },
      );
    } catch (err) {
      throw err;
    }
  }

  async findOne(condition): Promise<Investor> {
    return this.investorModel.findOne(condition);
  }
}
