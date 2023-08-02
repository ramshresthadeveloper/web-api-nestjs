import { Field, ObjectType } from '@nestjs/graphql';
import { MetaForPagination } from '@src/announcement/dto/response/announcementlist.response';
import { EnquiryCategory } from '@src/enquiry/entities/enquiry-category.entity';

@ObjectType()
export class EnquiryCategoryList {
  @Field(() => [EnquiryCategory])
  items: [EnquiryCategory];

  @Field(() => MetaForPagination)
  meta: MetaForPagination;
}
