import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreatePageInput {
  @Field()
  @IsNotEmpty({ message: 'Slug is required.' })
  @IsString()
  slug: string;

  @Field()
  @IsNotEmpty({ message: 'Title is required.' })
  @IsString()
  title: string;

  @Field()
  @IsNotEmpty({ message: 'Content is required.' })
  @IsString()
  content: string;
}
