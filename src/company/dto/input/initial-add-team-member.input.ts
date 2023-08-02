import { Field, ID, InputType } from '@nestjs/graphql';
import { TeamMemberRole } from '@src/constants/dbEnum';
import Lang from '@src/constants/language';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

@InputType()
export class InitialTeamMember {
  @Field()
  @IsEmail({}, { message: Lang.INVALID_EMAIL })
  @IsNotEmpty({ message: Lang.EMAIL_REQUIRED })
  email: string;

  @Field()
  @IsEnum(TeamMemberRole, {
    message: Lang.MUST_BE_VIEWER_OR_ADMIN,
  })
  @IsNotEmpty({ message: Lang.ROLE_REQUIRED })
  role: TeamMemberRole;
}

@InputType()
export class InitialAddTeamMemberDto {
  @Field(() => ID)
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  companyId: string;

  @Field(() => [InitialTeamMember])
  @IsArray()
  @Type(() => InitialTeamMember)
  @ArrayMinSize(1)
  @ValidateNested()
  newTeamMembers: InitialTeamMember[];
}
