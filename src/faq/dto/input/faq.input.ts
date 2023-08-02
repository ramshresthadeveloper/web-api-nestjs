import { Field, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateFaqInput {
  @Field()
  @IsString()
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  companyId: string;

  @Field()
  @IsString()
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  faqCategoryId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  question: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  answer: string;
}
