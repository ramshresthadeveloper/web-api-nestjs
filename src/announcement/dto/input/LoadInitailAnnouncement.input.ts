import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class LoadInitialAnnouncementInput {
  @Field()
  @IsNotEmpty()
  userId: string;

  @Field()
  @IsNotEmpty()
  companyId: string;

  @Field()
  @IsNotEmpty()
  permId: string;
}
