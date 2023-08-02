import { Field, ID, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { IsMongoId } from 'class-validator';
import { AnnouncementInput } from './announcement.input';

@InputType()
export class AnnouncementEditInput extends AnnouncementInput {
  @Field(() => ID)
  @IsMongoId(Lang.INVALID_MONGOID)
  announcementId: string;
}
