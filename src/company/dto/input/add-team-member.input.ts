import { Field, ID, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import {
  IsBoolean,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

@InputType()
export class AddTeamMemberDto {
  @Field(() => ID)
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  companyId: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: Lang.FIRST_NAME_REQUIRED })
  firstName: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: Lang.LAST_NAME_REQUIRED })
  lastName: string;

  @Field()
  @IsString()
  @IsEmail({}, { message: Lang.INVALID_EMAIL })
  @IsNotEmpty({ message: Lang.EMAIL_REQUIRED })
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: Lang.JOB_TITLE_REQUIRED })
  jobTitle: string;

  @Field()
  @MaxLength(20, {
    message: Lang.MOBILE_MAX_LENGTH,
  })
  @MinLength(10, {
    message: Lang.MOBILE_MIN_LENGTH,
  })
  @IsString()
  @Matches(
    /^(\+?\(61\)|\(\+?61\)|\+?61|\(0[1-9]\)|0[1-9])?( ?-?[0-9]){7,9}$/,
    {
      message: Lang.PROVIDE_VALID_MOBILE,
    },
    )
  @IsOptional()
  @ValidateIf((o) => o.mobileNum !== "")
  mobileNum: string;

  @Field(() => Boolean)
  @IsBoolean()
  canCreateEvent: boolean;

  @Field(() => Boolean)
  @IsBoolean()
  canManageQuestion: boolean;

  @Field(() => Boolean)
  @IsBoolean()
  canInviteTeamMembers: boolean;

  @Field(() => Boolean)
  @IsBoolean()
  hasAdministrativeControl: boolean;
}
