import { Field, ObjectType } from '@nestjs/graphql';
import { EnquiryFileResponse } from './enquiryFile.response';

@ObjectType()
export class EnquiryMultiFileResponse {
    @Field(() => [EnquiryFileResponse], { nullable: true })
    files: EnquiryFileResponse[];
}
