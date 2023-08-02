import { AdminRepository } from '@admin/repository/admin.repository';
import { AdminResolver } from '@admin/admin.resolver';
import { AdminService } from '@admin/admin.service';

export const providers = [AdminService, AdminResolver, AdminRepository];
