import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VerifiedTeamMember {
  @Field()
  userId: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  mobileNum: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  legalBusinessName: string;

  @Field({ nullable: true })
  verifiedAt: string;
}
