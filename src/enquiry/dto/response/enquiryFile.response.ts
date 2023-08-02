import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EnquiryFileResponse {
  @Field({ nullable: true })
  key: string;

  @Field({ nullable: true })
  thumbnailKey: string;

  @Field({ nullable: true })
  attachmentDuration: number;
}