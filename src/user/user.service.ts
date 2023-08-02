import { LoginUserInput } from 'src/user/dto/input/user.login.input';
import { BrowserInfoService } from './../browser_info/browser_info.service';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { EmailService } from 'src/mail/email.service';
import { UserRegisterInput } from './dto/input/userRegister.input';
import { UserRepository } from './repository/user.repository';
import { VerifyEmailOtpInput } from './dto/input/verify-email-otp.input';
import { EmailOtpRepository } from 'src/mail/repositories/email-otp.repository';
import { SendEmailOtpInput } from './dto/input/send-emai-otp.input';
import { UserResetPasswordInput } from './dto/input/user-reset-passwort.input';
import { CompanyRepository } from '@src/company/repository/company.repository';
import { User } from './entities/user.entity';
import { Company } from '@src/company/entity/company.entity';
import Lang from '@src/constants/language';
import * as bcrypt from 'bcrypt';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { RefreshTokenInput } from '@src/auth/dto/input/refreshToken.input';
import { TokenService } from '@src/auth/token.service';
import { UpdateProfileInput } from './dto/input/update-profile.input';
import { PasswordChangeInput } from './dto/input/password-change.input';
import { FileUpload } from 'graphql-upload';
import { S3BucketService } from '@src/s3-bucket/s3-bucket.service';
import { TokenRepository } from '@auth/repository/token.repository';
import { InviteMemberUpdateInput } from './dto/input/invite-member-update.input';
import { MailchimpService } from '@src/mailchimp/mailchimp.service';
import { CreateBrowserInfoDto } from '@src/browser_info/dto/create.browser.info.dto';
import { ForgetPasswordInput } from './dto/input/forget.password.input';
import { GoogleLoginInput } from './dto/input/google-login.input';
@Injectable()
export class UserService {
  private userArgs: any;
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly emailOtpRepo: EmailOtpRepository,
    private readonly companyRepo: CompanyRepository,
    private readonly httpService: HttpService,
    private readonly tokenService: TokenService,
    private readonly tokenRepo: TokenRepository,
    private readonly s3BucketService: S3BucketService,
    private readonly mailchimpService: MailchimpService,
    private readonly browserInfoService: BrowserInfoService,
  ) {
    this.userArgs = {};
  }
  async getUserList() {
    return await this.userRepository.findAll({
      usertType: { $ne: 'investor' },
    });
  }

  async create(userRegisterInput: UserRegisterInput) {
    try {
      const {
        email,
        firstName,
        fingerprint,
        lastName,
        acceptedTAndC,
        acceptedEmailCommunication,
      } = userRegisterInput;

      if (!acceptedTAndC) {
        throw new BadRequestException(Lang.NEED_ACCEPTED_TC);
      }

      const userExists = await this.userRepository.findOne({ email });
      if (userExists) {
        throw new ConflictException(Lang.EMAIL_TAKEN);
      }

      const user = await this.userRepository.create({
        ...userRegisterInput,
        userType: 'company_user',
        userName: `${firstName} ${lastName}`,
      });

      user.password = null;

      const { otpExpiresAt } = await this.emailService.sendOTPMail(
        {
          email: user.email,
        },
        fingerprint,
      );
      if (acceptedEmailCommunication) {
        this.userArgs.email = user.email;
        this.userArgs.firstName = user.firstName;
        this.userArgs.lastName = user.lastName;
        this.userArgs.tags = ['Company user', 'Customer'];
        await this.mailchimpService.addOrUpdate(this.userArgs);
      }
      return { otpExpiresAt: otpExpiresAt ? otpExpiresAt : '' };
    } catch (err) {
      throw err;
    }
  }

  async updateProfile(user: User, updateProfileInput: UpdateProfileInput) {
    try {
      const { firstName, lastName, email, mobileNum, profileImage, jobTitle } =
        updateProfileInput;

      const userExists = await this.userRepository.findOne(
        {
          $or: [{ email }, { mobileNum: mobileNum }],
          _id: { $ne: user._id },
        },
        { _id: 1, email: 1, mobileNum: 1 },
      );

      if (userExists && userExists.email === email) {
        throw new ConflictException(Lang.EMAIL_TAKEN);
      }

      if (
        mobileNum !== '' &&
        userExists &&
        userExists.mobileNum === mobileNum
      ) {
        throw new ConflictException(Lang.MOBILE_NUM_TAKEN);
      }

      const updatedUser = await this.userRepository.updateOne(
        { _id: user._id },
        {
          email,
          mobileNum,
          firstName,
          lastName,
          profileImage,
          jobTitle,
          userName: `${firstName} ${lastName}`,
        },
      );

      if (!updatedUser) {
        throw new NotFoundException(Lang.USER_NOT_FOUND);
      }

      updatedUser.password = null;

      return updatedUser;
    } catch (err) {
      throw err;
    }
  }

  async login(loginUserInput: LoginUserInput) {
    try {
      const user = await this.authService.validateUser(loginUserInput);
      const company = await this.companyRepo.findOne(
        {
          $or: [{ userId: user._id }, { 'teamMembers.userId': user._id }],
        },
        { _id: 1 },
      );
      const browserInfoDto: CreateBrowserInfoDto = {
        userId: user._id,
        fingerprint: loginUserInput.fingerprint,
        firebaseToken: loginUserInput.firebaseToken,
      };

      await this.browserInfoService.removeFirebaseTokenFromFingerprint(
        loginUserInput.fingerprint,
      );

      const browserInfo = await this.browserInfoService.getBrowserInfo(
        browserInfoDto,
      );
      if (!browserInfo) {
        const sendEmailOtpInput = {
          email: loginUserInput.email,
        };
        const otpData = await this.emailService.sendOTPMail(
          sendEmailOtpInput,
          loginUserInput.fingerprint,
        );
        return { otpData: otpData };
      }
      // else {
      //   await this.browserInfoService.updateFirebaseToken(
      //     browserInfoDto.userId,
      //     browserInfoDto.fingerprint,
      //     browserInfoDto.firebaseToken,
      //   );
      // }
      const payload = {
        sub: user._id,
        fingerprint: loginUserInput.fingerprint,
      };
      const token = this.authService.generateToken(payload);

      // await this.userRepository.updateByEmail(user.email, {
      //   lastLoggedInAt: new Date(),
      // });

      return {
        userData: {
          user,
          token,
          inCompany: company ? true : false,
        },
      };
    } catch (err) {
      throw err;
    }
  }

  async updateFirebaseToken(
    user: User,
    companyId: string,
    fingerprint: string,
    firebaseToken: string,
  ) {
    await this.browserInfoService.updateFirebaseToken(
      user._id,
      companyId,
      fingerprint,
      firebaseToken,
    );

    return { message: 'Firebase token updated successfully' };
  }

  async logoutUser(userId: string, fingerprint: string) {
    await this.browserInfoService.deleteFirebaseTokenAndCompanyId(
      userId,
      fingerprint,
    );
    return { status: Lang.LOGOUT_SUCCESS };
  }

  async sendEmailOtp(sendEmailOtpInput: SendEmailOtpInput) {
    try {
      return await this.emailService.sendOTPMail(
        sendEmailOtpInput,
        sendEmailOtpInput.fingerprint,
        sendEmailOtpInput.type,
      );
    } catch (err) {
      throw err;
    }
  }

  async verifyEmailOtp(verifyEmailOtpInput: VerifyEmailOtpInput) {
    try {
      const { email, otpCode, fingerprint, firebaseToken } =
        verifyEmailOtpInput;
      const otpMatched = await this.emailOtpRepo.findOne({
        email,
        otpCode,
        fingerprint,
      });

      if (!otpMatched) {
        throw new BadRequestException(Lang.INVALID_OTP);
      }

      if (otpMatched.expiredAt < new Date()) {
        throw new BadRequestException(Lang.INVALID_OTP);
      }
      const userInfo = await this.userRepository.findOne({ email });
      const browserInfoDto: CreateBrowserInfoDto = {
        userId: userInfo._id,
        fingerprint: fingerprint,
        firebaseToken: firebaseToken,
      };
      if (!userInfo.verifiedAt) {
        await this.userRepository.updateByEmail(email, {
          verifiedAt: new Date(),
        });
      }
      await this.browserInfoService.createNewBrowserInfo(browserInfoDto);
      const payload = {
        sub: userInfo._id,
        fingerprint: fingerprint,
      };
      const token = this.authService.generateToken(payload);
      const company = await this.companyRepo.findOne(
        {
          $or: [
            { userId: userInfo._id },
            { 'teamMembers.userId': userInfo._id },
          ],
        },
        { _id: 1 },
      );
      const response = {
        userData: {
          user: userInfo,
          token,
          inCompany: company ? true : false,
        },
      };

      this.emailOtpRepo.deleteOne({ _id: otpMatched._id });

      return response;
    } catch (err) {
      throw err;
    }
  }

  async validateTeamMemberInvitationToken(token) {
    try {
      const tokenInDb = await this.tokenRepo.findOne({
        token,
        tokenType: 'invite-member',
      });

      if (!tokenInDb) {
        throw new NotFoundException('Invalid or expired link.');
      }

      const tokenDetails = this.tokenService.verifyInviteMemberToken(token);
      // console.log('tokenDetails = ', tokenDetails);
      // this.tokenRepo.deleteOne({
      //   token,
      //   tokenType: 'invite-member',
      // });
      if (tokenDetails && tokenDetails.sub) {
        const user = await this.userRepository.findOne(
          { _id: tokenDetails.sub },
          {
            _id: 1,
            firstName: 1,
            lastName: 1,
            mobileNum: 1,
            email: 1,
            verifiedAt: 1,
          },
        );

        const company = await this.companyRepo.updateOne(
          { _id: tokenDetails.companyId, 'teamMembers.userId': user._id },
          { $set: { 'teamMembers.$.invitationAccepted': true } },
        );

        const response = Object.assign(
          { legalBusinessName: company.legalBusinessName, userId: user._id },
          user,
        );
        return response;
      }
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new NotFoundException('Invalid or expired link.');
      }
      throw err;
    }
  }

  async forgotPassword(userEmail: ForgetPasswordInput) {
    try {
      const { email } = userEmail;
      const user = await this.userRepository.findOne({
        email,
      });

      if (!user || !user.password) {
        throw new NotFoundException(Lang.EMAIL_NOT_FOUND);
      }

      const response = await this.emailService.sendForgotPasswordMail(user);

      return response;
    } catch (err) {
      throw err;
    }
  }

  async resetPassword(userResetPasswordInput: UserResetPasswordInput) {
    try {
      const { token, password } = userResetPasswordInput;

      const tokenDetails =
        await this.authService.validateUserForgotPasswordToken(token);

      const user = await this.userRepository.updateOne(
        {
          _id: tokenDetails.sub,
        },
        { password: await bcrypt.hash(password, Number(12)) },
      );

      if (!user) {
        throw new Error(Lang.INVALID_EXPIRED_TOKEN);
      }

      return { message: 'Password reset successfully.' };
    } catch (err) {
      throw err;
    }
  }

  async selectCompanyForLogin(
    user: User,
    companyId: string,
    fingerprint: string,
  ) {
    try {
      const userExistsInCompany: Company = await this.companyRepo.findOne(
        {
          _id: companyId,
          $or: [
            {
              userId: user._id,
            },
            { 'teamMembers.userId': user._id },
          ],
        },
        { _id: 1 },
      );
      if (!userExistsInCompany) {
        throw new UnauthorizedException();
      }
      const browserInfoDto: CreateBrowserInfoDto = {
        userId: user._id,
        fingerprint: fingerprint,
      };

      const browserInfo =
        this.browserInfoService.getBrowserInfo(browserInfoDto);
      if (!browserInfo) {
        throw new UnauthorizedException(Lang.BROWSER_NOT_VERIFIED);
      }
      const payload = {
        sub: user._id,
        fingerprint: fingerprint,
        companyId: userExistsInCompany ? userExistsInCompany._id : '',
      };

      const token = this.authService.generateToken(payload);
      await this.browserInfoService.updateLoggedInCompanyId(
        user._id,
        fingerprint,
        userExistsInCompany._id,
      );

      await this.userRepository.updateByEmail(user.email, {
        lastLoggedInAt: new Date(),
      });

      return {
        userData: {
          user,
          token,
        },
      };
    } catch (err) {
      throw err;
    }
  }

  async loginWithGoogle(googleLoginInput: GoogleLoginInput) {
    try {
      const { id_token, fingerprint, firebaseToken } = googleLoginInput;

      const googleDetails = await this.getGoogleDetails(id_token);

      if (!googleDetails.sub) {
        throw new InternalServerErrorException();
      }

      let user = await this.userRepository.findOne({
        email: googleDetails.email,
      });

      if (!user) {
        const [googleFirstName, ...googleLastName] =
          googleDetails.name.split(' ');
        user = await this.userRepository.create({
          firstName: googleDetails.given_name
            ? googleDetails.given_name
            : googleFirstName,
          lastName: googleDetails.family_name
            ? googleDetails.family_name
            : googleLastName.join(''),
          googleId: googleDetails.sub,
          userName: googleDetails.name,
          profileImage: googleDetails.picture,
          verifiedAt: new Date(),
          userType: 'company_user',
          acceptedTAndC: true,
          email: googleDetails.email,
          registeredWithGoogle: true,
        });
      } else {
        const userDataToUpdate: any = {
          lastLoggedInAt: new Date(),
        };
        if (!user.googleId) {
          userDataToUpdate.googleId = googleDetails.sub;
        }
        await this.userRepository.updateByEmail(user.email, userDataToUpdate);
      }
      const company = await this.companyRepo.findOne({
        userId: user._id,
      });

      const browserInfoDto: CreateBrowserInfoDto = {
        userId: user._id,
        fingerprint: fingerprint,
        firebaseToken: firebaseToken,
      };

      const browserInfo = await this.browserInfoService.getBrowserInfo(
        browserInfoDto,
      );
      if (!browserInfo) {
        await this.browserInfoService.createNewBrowserInfo(browserInfoDto);
      } else {
        await this.browserInfoService.updateFirebaseToken(
          browserInfoDto.userId,
          browserInfoDto.fingerprint,
          browserInfoDto.firebaseToken,
        );
      }

      const payload = {
        sub: user._id,
        companyId: company ? company._id : '',
        fingerprint: fingerprint,
      };

      const token = await this.authService.generateToken(payload);

      return {
        userData: {
          user,
          token,
        },
      };
    } catch (err) {
      throw err;
    }
  }

  async getGoogleDetails(id_token: string) {
    try {
      const response = lastValueFrom(
        this.httpService.get(
          'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + id_token,
        ),
      );

      return (await response).data;
    } catch (error) {
      throw new UnprocessableEntityException(Lang.INVALID_ID_TOKEN);
    }
  }

  async generateNewAccessToken({ refreshtoken }: RefreshTokenInput) {
    try {
      const { sub, companyId, fingerprint } =
        this.tokenService.verifyRefreshToken(refreshtoken);
      const browserData = await this.browserInfoService.getBrowserInfo({
        userId: sub,
        fingerprint: fingerprint,
      });
      if (!browserData) {
        throw new UnauthorizedException(Lang.BROWSER_NOT_VERIFIED);
      }
      return this.tokenService.generateAccessToken({ sub, companyId });
    } catch (err) {
      throw err;
    }
  }

  async changePassword(user: User, changePassword: PasswordChangeInput) {
    try {
      if (!user.password) {
        throw new ForbiddenException('SSO user cannot update password');
      }

      const { newPassword, oldPassword } = changePassword;

      const matchOldPassword = await bcrypt.compare(oldPassword, user.password);
      if (!matchOldPassword) {
        throw new BadRequestException(Lang.INVALID_OLD_PASSWORD);
      }

      if (await bcrypt.compare(newPassword, user.password)) {
        throw new BadRequestException(Lang.NEW_PASSWORD_SAME_WITH_OLD_PASSWORD);
      }

      await this.userRepository.changePassword(user._id, newPassword);

      await this.emailService.sendPasswordChangedMail(
        user.email,
        user.firstName,
      );

      return {
        message: Lang.PASSWORD_CHANGE_SUCCESS,
      };
    } catch (err) {
      throw err;
    }
  }

  async uploadFile(file: FileUpload) {
    try {
      const { createReadStream } = file;

      const stream = createReadStream();
      const chunks = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);

      const fileFromAws = await this.s3BucketService.uploadFileBuffer(
        buffer,
        file.mimetype,
        'profile-images',
      );

      return {
        key: fileFromAws.Key,
      };
    } catch (err) {
      throw err;
    }
  }

  async loggedInUserDetail(user: User) {
    try {
      const { _id: userId } = user;

      const loggedInUser = await this.userRepository.findOne({
        _id: userId,
      });

      if (!loggedInUser) {
        throw new NotFoundException(Lang.USER_NOT_FOUND);
      }

      return loggedInUser;
    } catch (err) {
      throw err;
    }
  }

  async addNewTeamMemberPassword(
    inviteMemberUpdateInput: InviteMemberUpdateInput,
  ) {
    try {
      const {
        firstName,
        lastName,
        mobileNum,
        password,
        userId,
        acceptedEmailCommunication,
      } = inviteMemberUpdateInput;
      try {
        const user = await this.userRepository.updateOne(
          {
            _id: userId,
            registeredWithGoogle: false,
            password: { $exists: false },
          },
          {
            firstName,
            lastName,
            mobileNum,
            password: await bcrypt.hash(password, Number(12)),
            verifiedAt: new Date(),
          },
        );

        if (acceptedEmailCommunication) {
          this.userArgs.email = user.email;
          this.userArgs.firstName = user.firstName;
          this.userArgs.lastName = user.lastName;
          this.userArgs.tags = ['Company user', 'Customer'];
          await this.mailchimpService.addOrUpdate(this.userArgs);
        }
      } catch (e) {
        throw new BadRequestException(Lang.INVALID_EXPIRED_TOKEN);
      }
      return { message: 'Password added successfully.' };
    } catch (err) {
      throw err;
    }
  }

  async switchCompany(user: User, companyId: string, fingerprint: string) {
    try {
      const userExistsInCompany: Company = await this.companyRepo.findOne({
        _id: companyId,
        $or: [
          {
            userId: user._id,
          },

          { 'teamMembers.userId': user._id },
        ],
      });
      if (!userExistsInCompany) {
        throw new UnauthorizedException();
      }
      const browserInfoDto: CreateBrowserInfoDto = {
        userId: user._id,
        fingerprint: fingerprint,
      };

      const browserInfo =
        this.browserInfoService.getBrowserInfo(browserInfoDto);
      if (!browserInfo) {
        throw new UnauthorizedException(Lang.BROWSER_NOT_VERIFIED);
      }
      const payload = {
        sub: user._id,
        fingerprint: fingerprint,
        companyId,
      };

      const token = this.authService.generateToken(payload);

      return {
        token,
      };
    } catch (err) {
      throw err;
    }
  }

  async lastOtp(user: User) {
    try {
      const { email } = user;

      const lastOtp = await this.emailOtpRepo.latestOtp({
        email,
      });

      if (!lastOtp) {
        throw new BadRequestException('No OTP found');
      }

      return {
        email: lastOtp.email,
        expiresAt: lastOtp.expiredAt.getTime(),
      };
    } catch (err) {
      throw err;
    }
  }

  async listCompaniesForSwitchCompanies(user: User) {
    try {
      const companyData =
        await this.companyRepo.getAllCompaniesUserIsMemberOfWithCreatorFlag(
          user._id,
        );
      return companyData;
    } catch (err) {
      throw err;
    }
  }

  async subscribeMailchimp() {
    let status = 'failed';
    const users = await this.userRepository.findAll({
      acceptedEmailCommunication: true,
    });
    for (let i = 0; i < users.length; i++) {
      const user = {
        email: users[i].email,
        firstName: users[i].firstName,
        lastName: users[i].lastName,
        tags: ['Company user', 'Customer'],
      };
      try {
        await this.mailchimpService.addOrUpdate(user);
        status = 'success';
      } catch (err) {
        status = 'failed';
      }
    }
    return { status };
  }
}
