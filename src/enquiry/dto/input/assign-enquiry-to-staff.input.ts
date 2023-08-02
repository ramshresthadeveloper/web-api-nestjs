import { Field, ID, InputType } from '@nestjs/graphql';
import { ArrayMinSize, ArrayUnique, IsArray, IsMongoId } from 'class-validator';

@InputType()
export class AssignEnquiriesToStaff {
  @Field(() => [ID])
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayUnique()
  @ArrayMinSize(1)
  enquiriesIds: string[];

  @Field(() => ID)
  @IsMongoId()
  staffId: string;

  @Field(() => ID)
  @IsMongoId()
  companyId: string;
}
