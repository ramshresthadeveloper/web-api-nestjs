import { Field, ObjectType } from '@nestjs/graphql';
import { Faq } from '@src/faq/entities/faq.entity';

@ObjectType()
export class FaqWithCategoryOutput {
  @Field((type) => [Faq], { nullable: true })
  faqs: [Faq];

  @Field()
  categoryName: string;

  @Field()
  _id: string;

  @Field()
  displayOrder: number;

  @Field()
  companyId: string;
}
