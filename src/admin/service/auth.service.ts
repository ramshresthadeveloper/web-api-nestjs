import { Injectable, BadRequestException } from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { AdminLoginInput } from '@admin/dto/input/admin.login.input';
import { AdminRepository } from '@admin/repository/admin.repository';
import Lang from '@src/constants/language';
import { AdminDocument } from '@admin/entity/admin.entity';

@Injectable()
export class AuthService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async validateAdmin(
    adminLoginInput: AdminLoginInput,
  ): Promise<AdminDocument> {
    try {
      const { email, password } = adminLoginInput;

      const admin = await this.adminRepository.findOne({ email });

      if (!admin) {
        throw new BadRequestException(Lang.INVALID_CREDENTIALS);
      }

      const match = await bcrypt.compare(password, admin.password);

      if (!match) {
        throw new BadRequestException(Lang.INVALID_CREDENTIALS);
      }

      return admin;
    } catch (error) {
      throw error;
    }
  }

  async login(adminLoginInput: AdminLoginInput) {
    const admin = await this.validateAdmin(adminLoginInput);

    const payload = { sub: admin._id };

    return;
  }
}
