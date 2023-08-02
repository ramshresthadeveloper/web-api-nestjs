import { Field, ID, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import {
  IsEmail,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

@InputType()
export class UpdateCompanyInput {
  @Field({ nullable: true })
  @IsOptional()
  companyLogo?: string;

  @Field()
  @MinLength(1)
  @MaxLength(1500)
  about: string;

  @Field(() => ID)
  @IsMongoId(Lang.INVALID_MONGOID)
  companyId: string;

  @Field({ nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field()
  @IsNotEmpty()
  legalBusinessName: string;

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
  longitude: number;

  @Field({ nullable: true })
  @IsNumber()
  latitude: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  phoneNumber?: string;
}
