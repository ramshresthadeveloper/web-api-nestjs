import { Field, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { IsMongoId, IsString } from 'class-validator';

@InputType()
export class DeleteFaqCategoryInput {
  @Field()
  @IsString()
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  companyId: string;

  @Field()
  @IsString()
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  faqCategoryId: string;
}
