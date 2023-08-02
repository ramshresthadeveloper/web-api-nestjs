import { Field, InputType } from '@nestjs/graphql';

import { IsMongoId, IsNotEmpty } from 'class-validator';

import MSG from '@src/constants/validation.message';

@InputType()
export class ExecutiveMemberIdInput {
  @Field()
  @IsMongoId({ message: MSG.MUST_BE_MONGO_ID })
  @IsNotEmpty({ message: MSG.PROPERTY_REQUIRED })
  memberId: string;
}
