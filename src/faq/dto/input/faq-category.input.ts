import { Field, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateFaqCategoryInput {
  @Field()
  @IsString()
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  companyId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;
}
