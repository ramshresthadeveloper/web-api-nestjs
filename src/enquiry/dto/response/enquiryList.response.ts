import { Field, ID, ObjectType } from '@nestjs/graphql';
import { MetaForPagination } from '@src/announcement/dto/response/announcementlist.response';
import { EnquiryResponse } from '@src/enquiry/entities/enquiry-response.entity';

@ObjectType()
export class EnquiryInvestor {
  @Field(() => ID, { nullable: true })
  _id: string;

  @Field({ nullable: true })
  firstName: string;
  @Field({ nullable: true })
  lastName: string;

  @Field({ nullable: true })
  userName: string;

  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  mobileNum: string;

  @Field({ nullable: true })
  investorStatus: string;
}

@ObjectType()
export class EnquiryWithInvestor {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  companyId: string;

  @Field(() => ID)
  investorId: string;

  @Field(() => ID, { nullable: true })
  enquiryCategoryId: string;

  @Field({ nullable: true })
  enquiryCategoryName: string;

  @Field(() => ID, { nullable: true })
  assignedTo: string;

  @Field(() => ID, { nullable: true })
  resolvedBy: string;

  @Field(() => ID, { nullable: true })
  archivedBy: string;

  @Field()
  subject: string;

  @Field()
  question: string;

  @Field({ nullable: true })
  audio: string;

  @Field({ nullable: true })
  status: string;

  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @Field(() => EnquiryInvestor, { nullable: true })
  investor: EnquiryInvestor;

  @Field({ nullable: true })
  rating: string;

  @Field({ nullable: true })
  enquiryResponse: EnquiryResponse;
}

@ObjectType()
export class EnquiryList {
  @Field(() => [EnquiryWithInvestor])
  items: [EnquiryWithInvestor];

  @Field(() => MetaForPagination)
  meta: MetaForPagination;
}
