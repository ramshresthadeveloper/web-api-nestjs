import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { configValidationSchema } from 'config/config.schema';
import { CompanyModule } from './company/company.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { PageManagementModule } from './page-management/page-management.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';

import { AnnouncementModule } from './announcement/announcement.module';
import { RefinitivModule } from './refinitiv/refinitiv.module';
import { S3BucketModule } from './s3-bucket/s3-bucket.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TimeseriesModule } from './timeseries/timeseries.module';
import { FaqModule } from './faq/faq.module';
import { EnquiryModule } from './enquiry/enquiry.module';
import { InvestorModule } from './investor/investor.module';
import { EventModule } from './event/event.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ExecutiveTeamModule } from './executive-team/executive-team.module';
import { ResponseTemplateModule } from './response-template/response-template.module';
import { NotificationModule } from './notification/notification.module';
import { ContactUsModule } from './contact-us/contact-us.module';
import { ActivityModule } from './activity/activity.module';
import { FeedbackModule } from './feedback/feedback.module';
import { MorningStarModule } from './morning-star/morning-star.module';
import { StripeModule } from './stripe/stripe.module';
import { StripeTransactionsModule } from './stripe-transactions/stripe-transactions.module';
import { MonthlyQuestionPromptModule } from './monthly-question-prompt/monthly-question-prompt.module';
import { BrowserInfoModule } from './browser_info/browser_info.module';
import { OnboardingChecklistModule } from './onboarding-checklist/onboarding-checklist.module';
import { CompanyViewsModule } from './company-views/company-views.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      validationSchema: configValidationSchema,
      cache: true,
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      exclude: ['/api*', '/nestjs*', '/^((?!cms).)*$'],
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri:
          configService.get('NODE_ENV') === 'local'
            ? configService.get('MONGO_DB_LOCAL')
            : configService.get('NODE_ENV') === 'dev'
              ? configService.get('MONGO_DB_DEV')
              : configService.get('NODE_ENV') === 'uat'
                ? configService.get('MONGO_DB_UAT')
                : configService.get('NODE_ENV') === 'prod'
                  ? configService.get('MONGO_DB_PROD')
                  : configService.get('DB_CONNECTION') +
                  '://' +
                  configService.get('DB_USER') +
                  ':' +
                  encodeURIComponent(configService.get('DB_PASS')) +
                  '@' +
                  configService.get('DB_HOST') +
                  '/' +
                  configService.get('DB_NAME'),

        useNewUrlParser: true,

        useUnifiedTopology: true,
      }),
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: false,
      cache: 'bounded',
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      path: '/nestjs',
    }),
    ScheduleModule.forRoot(),

    UserModule,
    AdminModule,
    CompanyModule,
    AuthModule,
    MailModule,
    PageManagementModule,
    AnnouncementModule,
    RefinitivModule,
    S3BucketModule,
    TimeseriesModule,
    FaqModule,
    EnquiryModule,
    InvestorModule,
    EventModule,
    ExecutiveTeamModule,
    ResponseTemplateModule,
    NotificationModule,
    ContactUsModule,
    ActivityModule,
    FeedbackModule,
    MorningStarModule,
    StripeModule,
    StripeTransactionsModule,
    MonthlyQuestionPromptModule,
    BrowserInfoModule,
    OnboardingChecklistModule,
    CompanyViewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

