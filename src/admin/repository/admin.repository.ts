import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from '../entity/admin.entity';

@Injectable()
export class AdminRepository {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
  ) {}

  async create(createAdminDto): Promise<Admin> {
    const createdAdmin = new this.adminModel(createAdminDto);

    return await createdAdmin.save();
  }

  async findAll(): Promise<Admin[]> {
    return this.adminModel.find();
  }

  async findOne(condition): Promise<AdminDocument> {
    return this.adminModel.findOne(condition);
  }

  async updateById(id, data) {
    return await this.adminModel.findByIdAndUpdate(id, data, { new: true });
  }
}
