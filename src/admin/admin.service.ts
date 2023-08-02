import { Body, ConflictException, Injectable } from '@nestjs/common';
import Lang from '@src/constants/language';
import * as mongoose from 'mongoose';
import { AdminUpdateInputDto } from './dto/input/admin.update.input';
import { AdminRepository } from './repository/admin.repository';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async createOrUpdateAdmin(adminUpdateInputDto: AdminUpdateInputDto) {
    try {
      const { email, _id } = adminUpdateInputDto;
      const condition: any = { email: email };
      if (_id) {
        condition._id = { $ne: _id };
      }
      const admin = await this.adminRepository.findOne(condition);

      if (admin) {
        throw new ConflictException(Lang.EMAIL_TAKEN);
      }
      if (_id) {
        await this.adminRepository.updateById(_id, adminUpdateInputDto);
        return {
          message: Lang.ADMIN_UPADATE_SUCCESS,
        };
      } else {
        adminUpdateInputDto.password = this.generatePassword(12);
        // console.log('new generated password => ', adminUpdateInputDto.password);
        //send email containing password to admin
        await this.adminRepository.create(adminUpdateInputDto);
        return {
          message: Lang.ADMIN_CREATED_EMAIL_SENT,
        };
      }
    } catch (err) {
      throw err;
    }
  }
  generatePassword(length: number) {
    const chars =
      '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const passwordLength = length;
    let password = '';
    for (let i = 0; i <= passwordLength; i++) {
      const randomNumber = Math.floor(Math.random() * chars.length);
      password += chars.substring(randomNumber, randomNumber + 1);
    }
    return password;
  }
}
