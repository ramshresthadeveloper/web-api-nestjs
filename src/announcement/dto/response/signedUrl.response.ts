import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SignedUrl {
  @Field({ nullable: true })
  signedUrl: string;
}
