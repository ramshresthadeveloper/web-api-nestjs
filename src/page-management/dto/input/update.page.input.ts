import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UpdatePageInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Page id is required.' })
  @IsString()
  id: string;

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
