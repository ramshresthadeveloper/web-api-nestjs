import { providers } from '@admin/providers';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { Admin, AdminSchema } from './entity/admin.entity';
import { AdminResolver } from './admin.resolver';
import { AdminRepository } from './repository/admin.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Admin.name,
        schema: AdminSchema,
      },
    ]),
  ],
  providers: providers,
})
export class AdminModule {}
