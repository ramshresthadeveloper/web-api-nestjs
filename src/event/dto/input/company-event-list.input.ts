import { Field, InputType } from '@nestjs/graphql';
import { PaginationInput } from '@src/announcement/dto/input/pagination.input';
import { IsDate, IsMongoId } from 'class-validator';

@InputType()
export class EventListInput extends PaginationInput {
  @Field()
  @IsMongoId()
  companyId: string;

  @Field()
  @IsDate()
  date: Date;
}
