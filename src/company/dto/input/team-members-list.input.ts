import { Field, ID, InputType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import { PaginationInput } from '@src/announcement/dto/input/pagination.input';

@InputType()
export class TeamMemberListInput extends PaginationInput {

  @Field(()=>ID, {nullable:true})
  @Prop({ 
    type: String
  })
  companyId: string;

  @Field({ nullable: true })
  @Prop({ 
    type: String
  })
  searchText: string;
}
