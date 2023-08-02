import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/user/entities/user.entity';

@ObjectType()
export class Tokens {
  @Field()
  accessToken: string;

  @Field()
  accessTokenExpiresIn: string;
  @Field()
  refreshToken: string;

  @Field()
  refreshTokenExpiresIn: string;
}

@ObjectType()
export class UserDataResponse {
  @Field()
  user: User;

  @Field()
  token: Tokens;

  @Field({ nullable: true })
  companyId: string;

  @Field({ nullable: true })
  inCompany: boolean;
}

@ObjectType()
export class OTPResponse {
  @Field()
  message: string;

  @Field()
  otpExpiresAt: Date;
}

@ObjectType()
export class UserLoginResponse {
  @Field({ nullable: true })
  otpData?: OTPResponse;

  @Field({ nullable: true })
  userData?: UserDataResponse;
}

@ObjectType()
export class AccessTokenResponse {
  @Field()
  accesstoken: string;

  @Field()
  accessTokenExpiresIn: string;
}
