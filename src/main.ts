import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { graphqlUploadExpress } from 'graphql-upload';
import { AppModule } from './app.module';

import * as firebaseAdmin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const configService: ConfigService = app.get(ConfigService);

  // Set the config options
  const adminConfig = {
    projectId: configService.get('FIREBASE_PROJECT_ID'),
    privateKey: configService.get('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    clientEmail: configService.get('FIREBASE_CLIENT_EMAIL'),
    messagingSenderId: configService.get('FIREBASE_MESSAGING_SENDER_ID'),
  };

  // Initialize the firebase admin app
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(adminConfig),
  });

  app.use('/stripe/webhook', bodyParser.raw({ type: 'application/json' }));

  app.useGlobalPipes(
    new ValidationPipe({
      skipMissingProperties: true,
    }),
  );
  app.use(graphqlUploadExpress({}));
  const logger = new Logger('nestjs', { timestamp: true });
  const PORT = process.env.API_PORT || 5000;
  await app.listen(PORT, () => {
    logger.log(`Api listening on port: ${PORT}`);
  });
}
bootstrap();
