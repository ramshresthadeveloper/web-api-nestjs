import { Field, ObjectType } from '@nestjs/graphql';

import { Company, TeamMember } from '@company/entity/company.entity';
import { User } from '@src/user/entities/user.entity';

@ObjectType()
export class TeamMemberWithUserDetail extends TeamMember {
  @Field(() => User)
  user: User;
}

@ObjectType()
export class CompanyDetail extends Company {
  @Field(() => [TeamMemberWithUserDetail])
  teamMembers: TeamMemberWithUserDetail[];

  @Field({ nullable:true })
  companyCreatorLastLoggedIn: Date;
}
