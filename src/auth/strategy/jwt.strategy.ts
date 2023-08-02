import {
  BrowserInfo,
  BrowserInfoDocument,
} from './../../browser_info/entities/browser.info.entity';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '@src/user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import Lang from '@src/constants/language';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(BrowserInfo.name)
    private browserModel: Model<BrowserInfoDocument>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET'),
    });
  }
  async validate(payload: any) {
    const loginWithGoogle = payload.loginWithGoogle;
    const browserData = await this.browserModel.findOne({
      userId: payload.sub,
      fingerprint: payload.fingerprint,
    });
    if (!browserData) {
      throw new UnauthorizedException(Lang.BROWSER_NOT_VERIFIED);
    }
    const user = await this.userModel.findOne({
      _id: payload.sub,
    });
    return user;
  }
}
