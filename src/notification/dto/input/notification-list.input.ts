import { PaginationInput } from '@announcement/dto/input/pagination.input';
import { Field, ID, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { IsMongoId } from 'class-validator';

@InputType()
export class NotificationListInput extends PaginationInput {
  @Field(() => ID)
  @IsMongoId(Lang.INVALID_MONGOID)
  companyId: string;
}
