import { Field, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { IsJWT } from 'class-validator';

@InputType()
export class RefreshTokenInput {
  @Field()
  @IsJWT({ message: Lang.MUST_BE_VALID_JWT_TOKEN })
  refreshtoken: string;
}
