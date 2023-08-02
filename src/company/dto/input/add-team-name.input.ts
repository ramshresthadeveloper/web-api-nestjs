import { Field, ID, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { IsMongoId } from 'class-validator';

@InputType()
export class AddTeamNameInputDto {
    @Field(() => ID)
    @IsMongoId({ message: Lang.INVALID_MONGOID })
    companyId: string;

    @Field({nullable:true})
    teamName: string;
}
