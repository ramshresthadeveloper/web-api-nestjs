import { Field, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { IsMongoId } from 'class-validator';

@InputType()
export class OrderFaqInput {
  @Field()
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  companyId: string;

  @Field()
  @IsMongoId({ message: Lang.INVALID_MONGOID })
  faqId: string;

  @Field()
  currentPosition: number;

  @Field()
  targetPosition: number;
}
