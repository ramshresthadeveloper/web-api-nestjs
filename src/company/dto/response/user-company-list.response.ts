import { ObjectType, OmitType } from '@nestjs/graphql';
import { Company } from '@src/company/entity/company.entity';

@ObjectType()
export class UserCompanyList extends OmitType(Company, ['teamMembers']) {}
