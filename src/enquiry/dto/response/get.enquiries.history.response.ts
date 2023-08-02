import { MetaForPagination } from '@announcement/dto/response/announcementlist.response';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { EnquiryInvestor } from './enquiryList.response';
import { EnquiryResponse } from '@enquiry/entities/enquiry-response.entity';

@ObjectType()
export class EnquiryData {
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
  assigneeName: string;

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
export class EnquiryDateGroupData {
  @Field({ nullable: false })
  date: string;

  @Field(() => [EnquiryData])
  enquiries: [EnquiryData];
}

@ObjectType()
export class EnquiryHistoryResponse {
  @Field(() => [EnquiryDateGroupData])
  items: [EnquiryDateGroupData];

  @Field(() => MetaForPagination)
  meta: MetaForPagination;
}
