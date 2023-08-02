import { Field, ID, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { IsMongoId, IsString } from 'class-validator';
import { CreateEnquiryCategoryInput } from './enquiry-category.input';

@InputType()
export class EditEnquiryCategory extends CreateEnquiryCategoryInput {
  @Field(() => ID)
  @IsString()
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  enquiryCategoryId: string;
}
