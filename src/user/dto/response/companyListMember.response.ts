import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CompanyListOfMemberResponse {
    @Field()
    _id: string;

    @Field()
    legalBusinessName: string;
}
