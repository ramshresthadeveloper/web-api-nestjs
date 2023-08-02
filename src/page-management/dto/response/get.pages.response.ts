import { Field, ObjectType } from '@nestjs/graphql';

import { Page } from '@src/page-management/entities/page.entity';

@ObjectType()
export class Pages {
  @Field(() => [Page], { nullable: true })
  pages: Page[];
}
