import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { AdminLoginInput } from '@admin/dto/input/admin.login.input';
import { AuthService } from '@admin/service/auth.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => String)
  async loginAdmin(@Args('body') adminLoginInput: AdminLoginInput) {
    return 'hi mom';
  }
}
