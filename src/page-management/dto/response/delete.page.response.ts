import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PageDeleteStatus {
  @Field()
  pageDeleteStatus: string;
}
