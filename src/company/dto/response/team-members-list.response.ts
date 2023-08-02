import { MetaForPagination } from '@announcement/dto/response/announcementlist.response';
import { TeamPermission } from '@company/entity/company.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '@src/user/entities/user.entity';

@ObjectType()
export class CompanyTeamMember {
  @Field(() => ID)
  companyId: string;

  @Field(() => ID, { nullable: true })
  teamMemberId: string;

  @Field(() => User)
  teamMember: User;

  @Field({ nullable: true })
  jobTitleInCompany: string;

  @Field({ nullable: true, defaultValue: false })
  companyCreator: boolean;

  @Field(() => [TeamPermission], { nullable: true })
  permissions: TeamPermission[];
}

@ObjectType()
export class TeamMembersList {
  @Field(() => [CompanyTeamMember])
  items: [CompanyTeamMember];

  @Field(() => MetaForPagination)
  meta: MetaForPagination;
}
