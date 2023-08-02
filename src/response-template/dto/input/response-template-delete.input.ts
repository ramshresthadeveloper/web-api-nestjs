import { Field, ID, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';
@InputType()
export class ResponseTemplateDeleteInput{
    @Field(() => ID)
    @IsMongoId(Lang.INVALID_MONGOID)
    responseTemplateId: string;

    @Field()
    @IsString()
    @IsMongoId({ message: Lang.INVALID_MONGOID })
    companyId: string;
}
