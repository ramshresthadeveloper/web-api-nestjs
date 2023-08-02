
import { Field, ObjectType, OmitType } from '@nestjs/graphql';
import { Company } from '@src/company/entity/company.entity';

@ObjectType()
export class CompanyListWithCreatorFlag extends OmitType(Company, ['teamMembers']) {
    @Field({ defaultValue: false })
    hasCreatedCompany: Boolean
 }
