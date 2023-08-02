import { Field, ID, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { IsMongoId, IsString } from 'class-validator';

@InputType()
export class NotificationIdOnlyInput {
  @Field(() => ID)
  @IsString()
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  notificationId: string;
}
