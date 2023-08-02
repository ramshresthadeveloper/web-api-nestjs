import { Field, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { IsMongoId } from 'class-validator';

@InputType()
export class AnnouncementDeleteInput {
  @Field()
  @IsMongoId(Lang.INVALID_MONGOID)
  announcementId: string;

  @Field()
  @IsMongoId(Lang.INVALID_MONGOID)
  companyId: string;
}
