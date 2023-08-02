import { Field, ID, InputType } from '@nestjs/graphql';
import { IsMongoId } from 'class-validator';
@InputType()
export class TotalEnqiryInput {
  @Field(() => ID)
  @IsMongoId()
  companyId: string;
}
