import { Field, ID, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { ArrayMaxSize, IsArray, IsIn, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class EnquiryResponseInput {
  @Field(() => ID)
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  companyId: string;

  @Field(() => ID)
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  enquiryId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @ArrayMaxSize(5)
  @Field(() => [String], { nullable: true })
  attachments: string[];

  @Field()
  @IsString()
  @IsIn(['responded','drafted'])
  status:string;
}
