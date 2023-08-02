import { Field, ID, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UpdateTeamMemberDetailDto {
  @Field(() => ID)
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  companyId: string;

  @Field(() => ID)
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  teamMemberId: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: Lang.JOB_TITLE_REQUIRED })
  firstName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  mobileNum: string;

  @Field({ nullable: true })
  @IsString()
  profileImage: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: Lang.JOB_TITLE_REQUIRED })
  jobTitle: string;
}
