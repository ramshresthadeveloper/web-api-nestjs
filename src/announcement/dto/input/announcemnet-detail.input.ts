import { IsMongoId, IsString } from 'class-validator';
import { Field, ID, InputType } from '@nestjs/graphql';

import Lang from '@src/constants/language';

@InputType()
export class AnnouncementDetailInput {
  @Field(() => ID)
  @IsString()
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  companyId: string;

  @Field(() => ID)
  @IsString()
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  announcementId: string;
}
