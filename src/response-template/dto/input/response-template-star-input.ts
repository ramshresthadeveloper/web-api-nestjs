import { Field, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { IsBoolean, IsMongoId } from 'class-validator';

@InputType()
export class ResponseTemplateStarInput {
  @Field()
  @IsMongoId(Lang.INVALID_MONGOID)
  responseTemplateId: string;

  @Field()
  @IsMongoId(Lang.INVALID_MONGOID)
  companyId: string;

  @Field(() => Boolean)
  @IsBoolean()
  starred: boolean;
}
