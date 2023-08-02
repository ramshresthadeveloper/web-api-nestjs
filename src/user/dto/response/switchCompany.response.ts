import { Field, ObjectType } from '@nestjs/graphql';
import { OTPResponse, Tokens } from './user.login.response';

@ObjectType()
export class SwitchCompanyResponse {
  @Field()
  token: Tokens;
}
