import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .required()
    .valid('stage', 'local', 'prod', 'dev', 'uat')
    .default('dev'),
  SYSTEM_LANGUAGE: Joi.string().required(),
  MONGO_DB_LOCAL: Joi.string(),
  MONGO_DB_PROD: Joi.string(),
  API_PORT: Joi.number().default(5000),
  SES_KEY: Joi.string().required(),
  SES_SECRET: Joi.string().required(),
  SES_REGION: Joi.string().required(),
  SES_FROM: Joi.string().required(),
  WEB_APP_URL: Joi.string().required(),
  TEMPLATE_DIR: Joi.string().required(),
  INVITATION_TEMPLATE_DIR: Joi.string().required(),
  FIREBASE_PROJECT_ID: Joi.string().required(),
  FIREBASE_PRIVATE_KEY: Joi.string().required(),
  FIREBASE_CLIENT_EMAIL: Joi.string().required(),
  FIREBASE_MESSAGING_SENDER_ID: Joi.string().required(),
  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  JWT_ACCESS_TOKEN_EXPIRES_IN: Joi.string().required(),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  JWT_REFRESH_TOKEN_EXPIRES_IN: Joi.string().required(),
  JWT_INVITATION_TOKEN_SECRET: Joi.string().required(),
  JWT_INVITATION_TOKEN_EXPIRES_IN: Joi.string().required(),
  MORNING_STAR_MICRO_SERVICE_PASSWORD: Joi.string().required(),
  MORNING_STAR_MICRO_SERVICE_USERNAME: Joi.string().required(),
  MORNING_STAR_WEB_SERVICE_PASSWORD: Joi.string().required(),
  MORNING_STAR_WEB_SERVICE_USERNAME: Joi.string().required(),
  S3_SECRET_KEY: Joi.string().required(),
  S3_ACCESS_KEY: Joi.string().required(),
  STRIPE_SECRET_KEY: Joi.string().required(),
  STRIPE_WEBHOOK_SECRET: Joi.string().required(),
  MAILCHIMP_API_KEY: Joi.string().required(),
  MAILCHIMP_SERVER_PREFIX: Joi.string().required(),
  MAILCHIMP_LIST_ID: Joi.string().required(),
  MAILCHIMP_JOURNEY_ID: Joi.string().required(),
  MAILCHIMP_STEP_ID: Joi.string().required(),
});
