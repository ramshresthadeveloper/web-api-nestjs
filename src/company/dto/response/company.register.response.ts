import { Field, ObjectType } from '@nestjs/graphql';
import { Company } from 'src/company/entity/company.entity';

@ObjectType()
export class RegisterCompanyResponse {
  @Field()
  company: Company;
}
