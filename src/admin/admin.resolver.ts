import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AdminService } from './admin.service';
import { AdminUpdateInputDto } from './dto/input/admin.update.input';
import { Message } from './dto/response/message.response';

@Resolver()
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  @Mutation(() => Message)
  async updateAdmin(
    @Args('adminUpdateInputDto') adminUpdateInputDto: AdminUpdateInputDto,
  ) {
    return this.adminService.createOrUpdateAdmin(adminUpdateInputDto);
  }
}
