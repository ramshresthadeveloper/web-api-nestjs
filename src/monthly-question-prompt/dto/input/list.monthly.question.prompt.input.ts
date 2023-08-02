import { Field, ID, InputType, Int } from '@nestjs/graphql';
import MSG from '@src/constants/validation.message';

import { IsMongoId, IsNotEmpty, IsOptional, IsPositive,} from 'class-validator';

@InputType()
export class ListMonthlyQuesitonPromptInput {
@Field()
  @IsMongoId({ message: MSG.MUST_BE_MONGO_ID })
  @IsNotEmpty({ message: MSG.PROPERTY_REQUIRED })
  companyId: string;

  @Field(() => Int, { nullable: true })
  @IsPositive()
  @IsOptional()
  page?: number;

  @Field(() => Int, { nullable: true })
  @IsPositive()
  @IsOptional()
  limit?: number;

}
