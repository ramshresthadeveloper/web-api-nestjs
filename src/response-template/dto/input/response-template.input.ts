import { Field, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import {
  ArrayMaxSize,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class ResponseTemplateInput {
  @Field()
  @IsString()
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  companyId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  content?: string;

  @IsArray()
  @ArrayMaxSize(5)
  @Field(() => [String], { nullable: true })
  attachments: string[];
}
