import { Field, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { IsBoolean, IsMongoId } from 'class-validator';

@InputType()
export class AnnouncementStarInput {
  @Field()
  @IsMongoId(Lang.INVALID_MONGOID)
  announcementId: string;

  @Field()
  @IsMongoId(Lang.INVALID_MONGOID)
  companyId: string;

  @Field(() => Boolean)
  @IsBoolean()
  starred: boolean;
}
