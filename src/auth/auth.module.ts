import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Token, TokenSchema } from './entities/token.entity';
import { TokenRepository } from './repository/token.repository';
import { JwtStrategy } from './strategy/jwt.strategy';
import { User, UserSchema } from '@src/user/entities/user.entity';
import { BrowserInfoModule } from '@src/browser_info/browser_info.module';
import { BrowserInfo, BrowserInfoSchema } from '@src/browser_info/entities/browser.info.entity';

@Module({
  imports: [
    UserModule,
    ConfigModule,
    BrowserInfoModule,
    JwtModule.registerAsync({
      imports: [ConfigModule, BrowserInfoModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
        },
      }),
    }),
    MongooseModule.forFeature([
      { name: Token.name, schema: TokenSchema },
      { name: User.name, schema: UserSchema },
      { name: BrowserInfo.name, schema: BrowserInfoSchema },
    ]),
  ],
  providers: [AuthService, TokenService, TokenRepository, JwtStrategy],
  exports: [AuthService, TokenRepository,],
})
export class AuthModule {}
