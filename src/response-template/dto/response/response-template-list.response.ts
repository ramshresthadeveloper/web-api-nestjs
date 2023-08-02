import { Field, ObjectType } from '@nestjs/graphql';
import { MetaForPagination } from '@src/announcement/dto/response/announcementlist.response';
import { ResponseTemplate } from '@src/response-template/entities/response-template.entity';

@ObjectType()
export class ResponseTemplateList {
  @Field(() => [ResponseTemplate])
  items: [ResponseTemplate];

  @Field(() => MetaForPagination)
  meta: MetaForPagination;
}
