import { Field, InputType } from '@nestjs/graphql';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUrl,
} from 'class-validator';

@InputType()
export class CreateCompanyInput {
  @Field()
  @IsNotEmpty()
  legalBusinessName: string;

  @Field()
  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  abn: number;

  @Field({ nullable: true })
  @IsOptional()
  asxCode: string;

  @Field({ nullable: true })
  @IsOptional()
  optionalBusinessName?: string;

  @Field()
  @IsNotEmpty()
  @IsUrl()
  websiteUrl: string;

  @Field()
  @IsNotEmpty()
  addressLineOne: string;

  @Field({ nullable: true })
  @IsOptional()
  addressLineTwo?: string;

  @Field()
  @IsNotEmpty()
  suburb: string;

  @Field()
  @IsNotEmpty()
  state: string;

  @Field()
  @IsNumber()
  @IsNotEmpty()
  @IsInt()
  postCode: number;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  longitude: number;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  latitude: number;
}
