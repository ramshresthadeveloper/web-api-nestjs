import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DeleteExecutiveMemberResponse {
  @Field()
  status: string;
}
