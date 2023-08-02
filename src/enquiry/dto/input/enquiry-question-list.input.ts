import { Field, InputType } from '@nestjs/graphql';
import { PaginationInput } from '@src/announcement/dto/input/pagination.input';
import Lang from '@src/constants/language';
import {
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

@InputType()
export class EnquiryQuestionListInput extends PaginationInput {
  @Field()
  @IsString()
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  companyId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsIn(['outstanding', 'assigned', 'resolved', 'archived'])
  @ValidateIf((o) => o.enquiryStatus)
  enquiryStatus?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsIn(['potential', 'current'])
  @ValidateIf((o) => o.investorStatus)
  investorStatus: string;

  @Field({ nullable: true })
  @IsString()
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  categoryId: string;

  @Field({ nullable: true })
  @IsString()
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  assigneeId: string;

  @Field({ nullable: true })
  @IsString()
  @IsIn(['asc', 'desc'])
  sortDir: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  searchText: string;
}
