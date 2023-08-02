import { IsNotEmpty, IsOptional, IsPositive } from 'class-validator';
import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class PaginationInput {
  @Field(() => Int)
  @IsPositive()
  @IsNotEmpty()
  page: number;

  @Field(() => Int, { nullable: true })
  @IsPositive()
  @IsOptional()
  limit: number;
}
