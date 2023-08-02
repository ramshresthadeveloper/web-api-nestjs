import { Field, Float, InputType, Int } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

@InputType()
export class AnnouncementInput {
  @Field()
  @IsMongoId(Lang.INVALID_MONGOID)
  companyId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  attachment: string;

  @Field({ nullable: true })
  @IsString()
  attachmentThumbnail: string;

  @Field({ nullable: true })
  @IsNumber()
  attachmentDuration: number;

  @Field()
  @IsString()
  @IsIn(['draft', 'published'])
  status: string;

  @Field({ nullable: true })
  @IsNumber()
  @IsPositive()
  attachmentSize?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsPositive()
  attachmentTotalPages: number;

  @Field(() => Boolean)
  @IsBoolean()
  media: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  isPinned: boolean;
}
