import { Field, ID, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { IsBoolean, IsMongoId } from 'class-validator';

@InputType()
export class UpdateTeamMemberPermissionInput {
  @Field(() => ID)
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  companyId: string;

  @Field(() => ID)
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  teamMemberId: string;

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
