import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';
import { Resolver } from '@nestjs/graphql';
import { Message } from '@src/admin/dto/response/message.response';
import { FileUrl } from '@src/announcement/dto/response/fileUrl.response';
import { CurrentUser } from '@src/auth/decorator/user.decorator';
import { RefreshTokenInput } from '@src/auth/dto/input/refreshToken.input';
import { GqlAuthGuard } from '@src/auth/guard/auth.guard';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { OtpWithMessage } from 'src/mail/dto/email-otp-sent.response';
import { GoogleLoginInput } from './dto/input/google-login.input';
import { InviteMemberUpdateInput } from './dto/input/invite-member-update.input';
import { PasswordChangeInput } from './dto/input/password-change.input';
import { SendEmailOtpInput } from './dto/input/send-emai-otp.input';
import { UpdateProfileInput } from './dto/input/update-profile.input';
import { UserResetPasswordInput } from './dto/input/user-reset-passwort.input';
import { LoginUserInput } from './dto/input/user.login.input';
import { UserRegisterInput } from './dto/input/userRegister.input';
import { VerifyEmailInviteMemberTokenInput } from './dto/input/verify-email-invite-token.input';
import { VerifyEmailOtpInput } from './dto/input/verify-email-otp.input';
import { CompanyListOfMemberResponse } from './dto/response/companyListMember.response';
import { LastOtp } from './dto/response/lastOtp.response';
import { RegisterUserResponse } from './dto/response/registerUser.response';
import { SwitchCompanyResponse } from './dto/response/switchCompany.response';
import {
  AccessTokenResponse,
  UserLoginResponse,
} from './dto/response/user.login.response';
import { VerifiedTeamMember } from './dto/response/verifiedTeamMember.response';
import { VerifyOTPResponse } from './dto/response/verify.email.response';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { LogoutUserInput } from './dto/input/user.logout.input';
import { UserLogoutResponse } from './dto/response/user.logout.response';
import { ForgetPasswordInput } from './dto/input/forget.password.input';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}
  @Mutation(() => RegisterUserResponse)
  async registerUser(
    @Args('userRegisterInput') userRegisterInput: UserRegisterInput,
  ) {
    return this.userService.create(userRegisterInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User)
  async updateUserProfile(
    @Args('updateProfileInput') updateProfileInput: UpdateProfileInput,
    @CurrentUser() user: User,
  ) {
    return this.userService.updateProfile(user, updateProfileInput);
  }

  @Mutation(() => UserLoginResponse)
  async userLogin(@Args('loginUserInput') loginUserInput: LoginUserInput) {
    return this.userService.login(loginUserInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => UserLogoutResponse)
  async userLogout(
    @Args('logoutUserInput') logoutUserInput: LogoutUserInput,
    @CurrentUser() user: User,
  ) {
    return this.userService.logoutUser(user._id, logoutUserInput.fingerprint);
  }

  @Mutation(() => OtpWithMessage)
  async sendEmailOtp(
    @Args('sendEmailOtpInput') sendEmailOtpInput: SendEmailOtpInput,
  ) {
    return this.userService.sendEmailOtp(sendEmailOtpInput);
  }

  @Mutation(() => VerifyOTPResponse)
  async verifyEmailOtp(
    @Args('verifyEmailOtpInput') verifyEmailOtpInput: VerifyEmailOtpInput,
  ) {
    return this.userService.verifyEmailOtp(verifyEmailOtpInput);
  }

  @Mutation(() => VerifiedTeamMember)
  async verifyEmailInviteMember(
    @Args('verifyEmailInviteTokenInput')
    verifyEmailInviteTokenInput: VerifyEmailInviteMemberTokenInput,
  ) {
    return this.userService.validateTeamMemberInvitationToken(
      verifyEmailInviteTokenInput.token,
    );
  }

  @Mutation(() => Message)
  async userForgotPassword(
    @Args('userEmailOnly') userEmail: ForgetPasswordInput,
  ) {
    return this.userService.forgotPassword(userEmail);
  }

  @Mutation(() => Message)
  async userResetPassword(
    @Args('userResetPasswordInput')
    userResetPasswordInput: UserResetPasswordInput,
  ) {
    return this.userService.resetPassword(userResetPasswordInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => UserLoginResponse)
  async selectCompanyForLogin(
    @CurrentUser() user: User,
    @Args('companyId') companyId: string,
    @Args('fingerprint') fingerprint: string,
  ) {
    return this.userService.selectCompanyForLogin(user, companyId, fingerprint);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Message)
  async updateFirebaseToken(
    @CurrentUser() user: User,
    @Args('companyId') companyId: string,
    @Args('fingerprint') fingerprint: string,
    @Args('firebaseToken') firebaseToken: string,
  ) {
    return this.userService.updateFirebaseToken(
      user,
      companyId,
      fingerprint,
      firebaseToken,
    );
  }

  @Mutation(() => UserLoginResponse)
  async loginWithGoogle(
    @Args('googleToken') googleLoginInput: GoogleLoginInput,
  ) {
    return await this.userService.loginWithGoogle(googleLoginInput);
  }

  @Mutation(() => AccessTokenResponse)
  async generateNewAccessToken(
    @Args('body') refreshTokenInput: RefreshTokenInput,
  ) {
    return this.userService.generateNewAccessToken(refreshTokenInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Message)
  async changePassword(
    @CurrentUser() user: User,
    @Args('passwordChangeInput') passwordChangeInput: PasswordChangeInput,
  ) {
    return await this.userService.changePassword(user, passwordChangeInput);
  }

  @Mutation(() => FileUrl)
  async uploadProfileImage(
    @Args('file', { type: () => GraphQLUpload }) file: FileUpload,
  ) {
    return this.userService.uploadFile(file);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  async loggedInUserDetail(@CurrentUser() user: User) {
    return this.userService.loggedInUserDetail(user);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [CompanyListOfMemberResponse])
  async listCompaniesForSwitchCompanies(@CurrentUser() user: User) {
    return this.userService.listCompaniesForSwitchCompanies(user);
  }

  @Mutation(() => Message)
  async addNewTeamMemberPassword(
    @Args('inviteMemberUpdateInput')
    inviteMemberUpdateInput: InviteMemberUpdateInput,
  ) {
    return this.userService.addNewTeamMemberPassword(inviteMemberUpdateInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => SwitchCompanyResponse)
  async switchCompany(
    @CurrentUser() user: User,
    @Args('companyId') companyId: string,
    @Args('fingerprint') fingerprint: string,
  ) {
    return this.userService.switchCompany(user, companyId, fingerprint);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => LastOtp)
  async getLastOtpSent(@CurrentUser() user: User) {
    return this.userService.lastOtp(user);
  }
  @UseGuards(GqlAuthGuard)
  @Query(() => UserLogoutResponse)
  async subscribeMailchimp() {
    return await this.userService.subscribeMailchimp();
  }
}
