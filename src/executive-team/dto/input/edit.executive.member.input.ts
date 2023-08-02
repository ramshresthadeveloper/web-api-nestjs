import { Field, InputType } from '@nestjs/graphql';

import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

import MSG from '@src/constants/validation.message';

@InputType()
export class EditExecutiveMemberInput {
  @Field()
  @IsMongoId({ message: MSG.MUST_BE_MONGO_ID })
  @IsNotEmpty({ message: MSG.PROPERTY_REQUIRED })
  memberId: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: MSG.NAME_REQUIRED })
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: MSG.ROLE_REQUIRED })
  role: string;

  @Field({ nullable: true })
  @IsString()
  linkedIn: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: MSG.DP_REQUIRED })
  digitalPicture: string;
}
