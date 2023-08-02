import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from 'src/auth/auth.service';
import { User, UserSchema } from './entities/user.entity';
import { UserRepository } from './repository/user.repository';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from 'src/mail/mail.module';
import { TokenRepository } from '@src/auth/repository/token.repository';
import { TokenService } from '@src/auth/token.service';
import { Token, TokenSchema } from '@src/auth/entities/token.entity';
import { CompanyRepository } from '@src/company/repository/company.repository';
import { Company, CompanySchema } from '@src/company/entity/company.entity';
import { HttpModule } from '@nestjs/axios';
import { InvestorRepository } from '@src/investor/repository/investor.repository';
import {
  Investor,
  InvestorSchema,
} from '@src/investor/entities/investor.entity';
import { S3BucketService } from '@src/s3-bucket/s3-bucket.service';
import { MailchimpService } from '@src/mailchimp/mailchimp.service';
import {
  BrowserInfo,
  BrowserInfoSchema,
} from '@src/browser_info/entities/browser.info.entity';
import { BrowserInfoModule } from '@src/browser_info/browser_info.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      { name: Token.name, schema: TokenSchema },
      { name: Company.name, schema: CompanySchema },
      { name: Investor.name, schema: InvestorSchema },
      { name: BrowserInfo.name, schema: BrowserInfoSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule,],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
        },
      }),
    }),
    MailModule,
    HttpModule,
    BrowserInfoModule,
  ],
  providers: [
    UserResolver,
    UserService,
    UserRepository,
    AuthService,
    TokenRepository,
    TokenService,
    CompanyRepository,
    InvestorRepository,
    S3BucketService,
    MailchimpService,
  ],
  exports: [UserService, UserRepository, UserModule],
})
export class UserModule {}
