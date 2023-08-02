import { Message } from '@admin/dto/response/message.response';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FileUrl } from '@src/announcement/dto/response/fileUrl.response';
import { CurrentUser } from '@src/auth/decorator/user.decorator';
import { GqlAuthGuard } from '@src/auth/guard/auth.guard';
import { User } from '@src/user/entities/user.entity';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { ResponseTemplateDeleteInput } from './dto/input/response-template-delete.input';
import { ResponseTemplateEditInput } from './dto/input/response-template-edit.input';
import { ResponseTemplateListInput } from './dto/input/response-template-list.input';
import { ResponseTemplateStarInput } from './dto/input/response-template-star-input';
import { ResponseTemplateInput } from './dto/input/response-template.input';
import { ResponseTemplateList } from './dto/response/response-template-list.response';
import { ResponseTemplate } from './entities/response-template.entity';
import { ResponseTemplateService } from './response-template.service';

@Resolver()
export class ResponseTemplateResolver {
  constructor(
    private readonly responseTemplateService: ResponseTemplateService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => ResponseTemplateList)
  async getResponseTemplatesList(
    @CurrentUser() user: User,
    @Args('responseTemplateListInput')
    responseTemplateListInput: ResponseTemplateListInput,
  ) {
    return this.responseTemplateService.getResponseTemplates(
      user,
      responseTemplateListInput,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ResponseTemplate)
  createResponseTemplate(
    @CurrentUser() user: User,
    @Args('responseTemplateInput') responseTemplateInput: ResponseTemplateInput,
  ) {
    return this.responseTemplateService.createResponseTemplate(
      user,
      responseTemplateInput,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ResponseTemplate)
  updateResponseTemplate(
    @CurrentUser() user: User,
    @Args('responseTemplateEditInput')
    responseTemplateEditInput: ResponseTemplateEditInput,
  ) {
    return this.responseTemplateService.updateResponseTemplate(
      user,
      responseTemplateEditInput,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Message)
  hardDeleteResponseTemplate(
    @CurrentUser() user: User,
    @Args('responseTemplateDeleteInput')
    responseTemplateDeleteInput: ResponseTemplateDeleteInput,
  ) {
    return this.responseTemplateService.deleteResponseTemplate(
      user,
      responseTemplateDeleteInput,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ResponseTemplate)
  starResponseTemplate(
    @CurrentUser() user: User,
    @Args('responseTemplateStarInput')
    responseTemplateStarInput: ResponseTemplateStarInput,
  ) {
    return this.responseTemplateService.starResponseTemplate(
      user,
      responseTemplateStarInput,
    );
  }

  @Mutation(() => FileUrl)
  async uploadResponseTemplateAttachment(
    @Args('file', { type: () => GraphQLUpload }) file: FileUpload,
  ) {
    return this.responseTemplateService.uploadFile(file);
  }
}
