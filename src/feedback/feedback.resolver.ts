import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@auth/guard/auth.guard';
import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';

import { FileUrl } from '@announcement/dto/response/fileUrl.response';
import { FeedBackCreateInput } from './dto/input/feedback-create.input';
import { FeedbackService } from './feedback.service';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { Issue } from './entities/issue.entity';
import { CurrentUser } from '@auth/decorator/user.decorator';
import { User } from '@src/user/entities/user.entity';

@Resolver()
export class FeedbackResolver {
  constructor(private readonly feedbackService: FeedbackService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Issue)
  submitFeedback(
    @CurrentUser() user: User,
    @Args('feedbackInput') feedbackInput: FeedBackCreateInput,
  ) {
    return this.feedbackService.createFeedback(user, feedbackInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => FileUrl)
  async uploadFeebackAttachment(
    @Args('file', { type: () => GraphQLUpload }) file: FileUpload,
  ) {
    return this.feedbackService.uploadFile(file);
  }
}
