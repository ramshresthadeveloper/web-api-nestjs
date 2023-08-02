import { ObjectType, Field } from "@nestjs/graphql";

@ObjectType()
export class TeamNameResponse {
    @Field({nullable:true})
    teamName: String;
}
