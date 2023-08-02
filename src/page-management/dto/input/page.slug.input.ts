import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class PageSlugInput {
  @Field()
  @IsNotEmpty({ message: 'Slug is required.' })
  @IsString()
  slug: string;
}
