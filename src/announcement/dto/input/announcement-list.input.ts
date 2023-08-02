import { Field, ID, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { IsBoolean, IsIn, IsMongoId, IsOptional } from 'class-validator';
import { PaginationInput } from './pagination.input';

@InputType()
export class AnnouncementListInput extends PaginationInput {
  @Field(() => ID)
  @IsMongoId(Lang.INVALID_MONGOID)
  companyId: string;

  @Field({ nullable: true })
  @IsIn(['draft', 'published'])
  @IsOptional()
  status?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  deleted?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  starred?: boolean;
}
