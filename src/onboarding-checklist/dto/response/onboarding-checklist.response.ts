import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OnboardingChecklistResponse {
  @Field({ nullable: false })
  addCompanyLogo: boolean;

  @Field({ nullable: false })
  addCompanyBio: boolean;

  @Field({ nullable: false })
  addExecutive: boolean;

  @Field({ nullable: false })
  addFAQ: boolean;

  @Field({ nullable: false })
  inviteInvestors: boolean;

  @Field({ nullable: true })
  completionTime?: Date;

  @Field({ nullable: false })
  showOnboardingChecklist: boolean;
}
