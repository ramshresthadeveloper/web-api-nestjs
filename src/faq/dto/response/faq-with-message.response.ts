import { Field, ObjectType } from '@nestjs/graphql';
import { Faq } from '@src/faq/entities/faq.entity';

@ObjectType()
export class FaqWithMessageResponse {
  @Field({ nullable: true })
  message: string;

  @Field((type) => Faq)
  faq: Faq;
}
