import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoginUserInput } from 'src/user/dto/input/user.login.input';
import { User } from 'src/user/entities/user.entity';
import { UserRepository } from 'src/user/repository/user.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import Lang from '@src/constants/language';
import { TokenRepository } from './repository/token.repository';
import { TokenService } from './token.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly tokenRepo: TokenRepository,
    private readonly tokenService: TokenService,
  ) {}
  async validateUser(loginUserInput: LoginUserInput): Promise<User> {
    try {
      const { email, password } = loginUserInput;

      const user = await this.userRepository.findOne({ email });
      if (!user) {
        throw new BadRequestException(Lang.USER_DOESNOT_EXIST);
      }

      if (!user.password) {
        throw new BadRequestException(Lang.INVALID_CREDENTIALS);
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        throw new BadRequestException(Lang.INVALID_CREDENTIALS);
      }

      return user;
    } catch (err) {
      throw err;
    }
  }

  async generateToken(payload) {
    try {
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN'),
      });

      return {
        accessToken: 'Bearer ' + accessToken,
        accessTokenExpiresIn: this.configService.get(
          'JWT_ACCESS_TOKEN_EXPIRES_IN',
        ),
        refreshToken: refreshToken,
        refreshTokenExpiresIn: this.configService.get(
          'JWT_REFRESH_TOKEN_EXPIRES_IN',
        ),
      };
    } catch (err) {
      throw err;
    }
  }

  async validateUserForgotPasswordToken(token) {
    try {
      const tokenInDb = await this.tokenRepo.findOne({
        token,
        tokenType: 'user-forgot-password',
      });

      if (!tokenInDb) {
        throw new NotFoundException('Invalid or expired link.');
      }

      const tokenDetails = this.tokenService.verifyToken(token);

      this.tokenRepo.deleteOne({
        token,
        tokenType: 'user-forgot-password',
      });
      return tokenDetails;
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new NotFoundException('Invalid or expired link.');
      }
      throw err;
    }
  }

  async validateTeamMemberInvitationToken(token) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_INVITATION_TOKEN_SECRET'),
      });
      return payload;
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new NotFoundException('Invalid or expired link.');
      }
    }
  }
}
