import { Field, ID, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import {
  IsBoolean,
  IsDate,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class CompanyEventInput {
  @Field(() => ID)
  @IsMongoId(Lang.INVALID_MONGOID)
  companyId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  location: string;

  @Field()
  @IsBoolean()
  allDay: boolean;

  @Field()
  @IsBoolean()
  @IsOptional()
  isHoliday: boolean;

  @Field()
  @IsDate()
  date: Date;

  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @Field()
  @IsString()
  @IsIn(['admin', 'investors', 'both'])
  eventAttendies: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  attachment?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  startTime?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  endTime?: string;
}
