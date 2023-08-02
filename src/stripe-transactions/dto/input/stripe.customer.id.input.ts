import { Field, ID, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

import MSG from '@src/constants/validation.message';

@InputType()
export class StripeCustomerIdInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty({ message: MSG.PROPERTY_REQUIRED })
  id: string;
}
