import { Field, ID, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { IsMongoId } from 'class-validator';

@InputType()
export class TeamMemberDetailInputDto {
  @Field(() => ID)
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  companyId: string;

  @Field(() => ID)
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  teamMemberId: string;
}
