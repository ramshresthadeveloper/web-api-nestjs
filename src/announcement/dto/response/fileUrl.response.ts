import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FileUrl {
  @Field({ nullable: true })
  key: string;

  @Field({ nullable: true })
  thumbnailKey: string;

  @Field({ nullable: true })
  attachmentDuration: number;
}
