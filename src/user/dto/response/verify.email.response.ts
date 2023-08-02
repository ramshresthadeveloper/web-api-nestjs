import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '@user/entities/user.entity';
import { UserDataResponse } from './user.login.response';

@ObjectType()
export class VerifyOTPResponse {
  @Field({ nullable: true })
  userData: UserDataResponse;
}
