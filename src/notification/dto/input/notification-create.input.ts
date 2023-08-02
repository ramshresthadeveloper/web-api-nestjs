import { Field, ID, InputType } from '@nestjs/graphql';
import { NotificationMetaData } from '@notification/entities/notification.entity';
import {ENUM}from '@src/constants/dbEnum';
import Lang from '@src/constants/language';
import { IsIn, IsMongoId, IsString } from 'class-validator';

@InputType()
export class NotificationCreateInput {
  @Field(() => ID)
  @IsMongoId(Lang.INVALID_MONGOID)
  companyId: string;

  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  message: string;

  @Field()
  @IsIn(ENUM.notificationType)
  notificationType: string;

  @Field(() => NotificationMetaData, { nullable: true })
  metaData: NotificationMetaData;
}
