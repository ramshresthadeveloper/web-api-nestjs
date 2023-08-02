import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsMongoId, IsOptional, IsPositive, IsString } from 'class-validator';

@InputType()
export class EnquiryCategoryListInput {
  @Field(() => ID)
  @IsMongoId()
  companyId: string;

  @Field()
  @IsString()
  searchText: string;

  @Field(() => Int, { nullable: true })
  @IsPositive()
  @IsOptional()
  page: number;

  @Field(() => Int, { nullable: true })
  @IsPositive()
  @IsOptional()
  limit: number;
}
