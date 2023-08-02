import { Field, ObjectType } from '@nestjs/graphql';
import { FaqCategory } from '@src/faq/entities/faq-category.entity';

@ObjectType()
export class FaqCategoryWithMessageResponse {
  @Field({ nullable: true })
  message: string;

  @Field((type) => FaqCategory)
  faqCategory: FaqCategory;
}
