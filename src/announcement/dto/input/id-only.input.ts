import { Field, ID, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { IsMongoId } from 'class-validator';

@InputType()
export class IdOnly {
  @Field(() => ID)
  @IsMongoId(Lang.INVALID_MONGOID)
  id: string;
}
