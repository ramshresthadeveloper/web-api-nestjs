import { Field, ID, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { IsMongoId } from 'class-validator';
import { CompanyEventInput } from './company-event.input';

@InputType()
export class CompanyEventEditInput extends CompanyEventInput {
  @Field(() => ID)
  @IsMongoId(Lang.INVALID_MONGOID)
  eventId: string;
}
