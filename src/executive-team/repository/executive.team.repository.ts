import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

import mongoose, { Model } from 'mongoose';

import {
  ExecutiveTeam,
  ExecutiveTeamDocument,
} from '@executive-team/entities/executive.team.entity';
import { AddExecutiveMemberInput } from '@executive-team/dto/input/add.executive.member.input';
import { EditExecutiveMemberInput } from '@executive-team/dto/input/edit.executive.member.input';

@Injectable()
export class ExecutiveTeamRepository {
  constructor(
    @InjectModel(ExecutiveTeam.name)
    private readonly executiveTeamModel: Model<ExecutiveTeamDocument>,
  ) {}

  async findById(memberId: string) {
    return await this.executiveTeamModel.findById(memberId);
  }

  async createExecutiveMember(
    addExecutiveMemberInput: AddExecutiveMemberInput,
  ) {
    const newMember = new this.executiveTeamModel(addExecutiveMemberInput);
    return await newMember.save();
  }

  async getExecutiveMembers(companyId: string) {
    return await this.executiveTeamModel.find({ companyId });
  }

  async deleteExecutiveMember(memberId: string) {
    await this.executiveTeamModel.findByIdAndDelete(memberId);
  }

  async bulkDelete(condition) {
    return await this.executiveTeamModel.deleteMany(condition);
  }

  async editExecutiveMember({
    memberId,
    name,
    role,
    linkedIn,
    digitalPicture,
  }: EditExecutiveMemberInput) {
    return await this.executiveTeamModel.findByIdAndUpdate(
      { _id: memberId },
      {
        name,
        role,
        digitalPicture,
        linkedIn,
      },
      { new: true },
    );
  }

  async getExecutiveMembersCount(companyId: mongoose.Types.ObjectId) {
    return await this.executiveTeamModel.find({ companyId: companyId }).count();
  }
}
