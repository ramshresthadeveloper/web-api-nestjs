import { Field, ID, InputType } from '@nestjs/graphql';
import { ArrayMinSize, ArrayUnique, IsArray, IsMongoId } from 'class-validator';

@InputType()
export class AssignEnquiriesToCategoriesInput {
  @Field(() => [ID])
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayUnique()
  @ArrayMinSize(1)
  enquiriesIds: string[];

  @Field(() => ID)
  @IsMongoId()
  categoryId: string;

  @Field(() => ID)
  @IsMongoId()
  companyId: string;
}
