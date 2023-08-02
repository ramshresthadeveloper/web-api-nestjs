import { ConfigService } from '@nestjs/config';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import Lang from '@src/constants/language';

interface PayLoad {
  sub: string;
  companyId?: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  generateAccessToken(payload: PayLoad) {
    try {
      const access_token = this.jwtService.sign(payload);

      return {
        accesstoken: 'Bearer ' + access_token,
        accessTokenExpiresIn: this.configService.get(
          'JWT_ACCESS_TOKEN_EXPIRES_IN',
        ),
      };
    } catch (error) {
      throw error;
    }
  }

  generateRefreshToken(payload: PayLoad) {
    try {
      const refresh_token = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN'),
      });

      return {
        refreshtoken: refresh_token,
        refreshTokenExpiresIn: this.configService.get(
          'JWT_REFRESH_TOKEN_EXPIRES_IN',
        ),
      };
    } catch (error) {
      throw error;
    }
  }

  generateForgotPasswordToken(payload) {
    try {
      const token = this.jwtService.sign(payload);
      return token;
    } catch (err) {
      throw err;
    }
  }

  generateInvitationToken(payload) {
    try {
      const token = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_INVITATION_TOKEN_SECRET'),
        expiresIn: this.configService.get('JWT_INVITATION_TOKEN_EXPIRES_IN'),
      });
      return token;
    } catch (err) {
      throw err;
    }
  }

  verifyRefreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      });

      if (!payload) {
        throw new BadRequestException(Lang.INVALID_TOKEN);
      }

      return payload;
    } catch (err) {
      throw new BadRequestException(Lang.INVALID_TOKEN);
    }
  }

  verifyToken(token: string) {
    const payload = this.jwtService.verify(token, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
    });
    return payload;
  }

  verifyInviteMemberToken(token: string) {
    const payload = this.jwtService.verify(token, {
      secret: this.configService.get('JWT_INVITATION_TOKEN_SECRET'),
    });
    return payload;
  }
}
