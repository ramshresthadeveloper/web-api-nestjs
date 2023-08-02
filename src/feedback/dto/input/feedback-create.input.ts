import { Field, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class FeedBackCreateInput {
  @Field()
  @IsString()
  @MaxLength(200)
  title: string;

  @Field()
  @IsString()
  @MaxLength(350)
  description: string;

  @Field({ nullable: true})
  @IsString()
  @IsOptional()
  attachment: string;

  @Field()
  @IsMongoId(Lang.INVALID_MONGOID)
  companyId: string;
}
