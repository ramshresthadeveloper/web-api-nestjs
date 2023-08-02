import { Field, ID, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { IsBoolean, IsMongoId, IsOptional } from 'class-validator';
import { ResponseTemplateInput } from './response-template.input';

@InputType()
export class ResponseTemplateEditInput extends ResponseTemplateInput {
  @Field(() => ID)
  @IsMongoId(Lang.INVALID_MONGOID)
  responseTemplateId: string;

  @Field(() => Boolean)
  @IsBoolean()
  deleted: boolean;

  @Field(() => Boolean)
  @IsBoolean()
  starred: boolean;
}
