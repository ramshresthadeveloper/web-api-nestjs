import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../entities/user.entity';
import { Model } from 'mongoose';
import Lang from '@src/constants/language';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto): Promise<User> {
    return await this.userModel.create(createUserDto);
  }

  async findAll(condition): Promise<User[]> {
    return this.userModel.find(condition);
  }

  async findOne(condition, select = null) {
    const result = this.userModel.findOne(condition).lean();
    if (select) {
      result.select(select);
    }
    return result.exec();
  }

  async updateByEmail(email, data): Promise<User> {
    return this.userModel.findOneAndUpdate({ email }, data, { new: true });
  }

  async updateOne(condition, data) {
    return await this.userModel.findOneAndUpdate(condition, data, {
      new: true,
    });
  }

  async changePassword(userId, password) {
    const user = await this.userModel.findById(userId);
    user.password = password;
    return await user.save();
  }

  async updateTeamMemberDetailUser(teamMemberId, dataToUpdate) {
    try {
      return await this.userModel.findOneAndUpdate(
        {
          _id: teamMemberId,
        },
        { $set: dataToUpdate },
        { new: true },
      );
    } catch (e) {
      if (e.code === 11000) {
        throw new ConflictException(Lang.MOBILE_NUM_TAKEN);
      }
    }
  }

  async getUserIdsFromEmails(emails: String[]): Promise<String[]> {
    const result = await this.userModel.find(
      {
        email: {
          $in: emails,
        },
      },
      {
        _id: 1,
      },
    );
    const userIds = result.map((doc: any) => doc?._id.toString());
    return userIds;
  }

  async removeStripeDetails(user: UserDocument) {
    await this.userModel.findByIdAndUpdate(user._id, {
      $unset: { plan: '', stripeCustomerId: '', subscriptionStatus: '' },
    });
  }
}
