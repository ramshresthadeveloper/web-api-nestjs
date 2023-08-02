import { Field, ID, InputType } from '@nestjs/graphql';
import { IsMongoId, IsOptional, IsString } from 'class-validator';

import { PaginationInput } from '@src/announcement/dto/input/pagination.input';
import Lang from '@src/constants/language';

@InputType()
export class ResponseTemplateListInput extends PaginationInput {
  @Field((type) => ID)
  @IsString()
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  companyId: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  responseTemplateType?: string;
}
