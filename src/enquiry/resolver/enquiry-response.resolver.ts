import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { FileUrl } from '@src/announcement/dto/response/fileUrl.response';
import { CurrentUser } from '@src/auth/decorator/user.decorator';
import { GqlAuthGuard } from '@src/auth/guard/auth.guard';
import { User } from '@src/user/entities/user.entity';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { EnquiryResponseInput } from '../dto/input/enquiry-response.input';
import { EnquiryResponse } from '../entities/enquiry-response.entity';
import { EnquiryResponseService } from '../service/enquiry-response.service';

@Resolver()
export class EnquiryResponseResolver {
  constructor(
    private readonly enquiryResponseService: EnquiryResponseService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => EnquiryResponse)
  async addEnquiryResponse(
    @CurrentUser() user: User,
    @Args('enquiryResponseInput') enquiryResponseInput: EnquiryResponseInput,
  ) {
    return await this.enquiryResponseService.addEnquiryResponse(
      user,
      enquiryResponseInput,
    );
  }

  @Mutation(() => FileUrl)
  async uploadEnquiryResponseFile(
    @Args('file', { type: () => GraphQLUpload }) file: FileUpload,
  ) {
    return this.enquiryResponseService.uploadEnquiryResponseFile(file);
  }
}
