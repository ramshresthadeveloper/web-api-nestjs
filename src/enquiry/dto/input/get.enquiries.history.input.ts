import { PaginationInput } from '@announcement/dto/input/pagination.input';
import { Field, ID, InputType } from '@nestjs/graphql';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class GetEnquiriesHistoryInput extends PaginationInput {
  @Field(() => ID)
  @IsMongoId()
  @IsNotEmpty()
  viewedEnquiryId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  searchText: string;

  @Field(() => ID)
  @IsMongoId()
  @IsNotEmpty()
  companyId: string;

  @Field(() => ID)
  @IsMongoId()
  @IsNotEmpty()
  investorId: string;
}
