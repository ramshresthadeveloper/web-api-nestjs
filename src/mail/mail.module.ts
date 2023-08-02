import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenRepository } from '@src/auth/repository/token.repository';
import { TokenService } from '@src/auth/token.service';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { UserRepository } from 'src/user/repository/user.repository';
import { EmailService } from './email.service';
import { EmailOtp, EmailOtpSchema } from './entities/email-otp.entity';
import { EmailOtpRepository } from './repositories/email-otp.repository';
import { SESEmailService } from './ses.email.service';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Token, TokenSchema } from '@src/auth/entities/token.entity';
import {
  EmailTemplate,
  EmailTemplateSchema,
} from './entities/email-template.entity';
import { EmailTemplateRepository } from './repositories/email-template.repository';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: EmailOtp.name,
        schema: EmailOtpSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Token.name,
        schema: TokenSchema,
      },
      {
        name: EmailTemplate.name,
        schema: EmailTemplateSchema,
      },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
        },
      }),
    }),
  ],
  providers: [
    EmailService,
    SESEmailService,
    EmailOtpRepository,
    UserRepository,
    TokenRepository,
    TokenService,
    EmailTemplateRepository,
  ],
  exports: [EmailService, SESEmailService, EmailOtpRepository],
})
export class MailModule {}
