import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Message } from '@src/admin/dto/response/message.response';
import { CurrentUser } from '@src/auth/decorator/user.decorator';
import { GqlAuthGuard } from '@src/auth/guard/auth.guard';
import { User } from '@src/user/entities/user.entity';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { AnnouncementService } from './announcement.service';
import { AnnouncementDeleteInput } from './dto/input/announcement-delete.input';
import { AnnouncementEditInput } from './dto/input/announcement-edit.input';
import { AnnouncementListInput } from './dto/input/announcement-list.input';
import { AnnouncementStarInput } from './dto/input/announcement-star.input';
import { AnnouncementInput } from './dto/input/announcement.input';
import { AnnouncementDetailInput } from './dto/input/announcemnet-detail.input';
import { EngagementInput } from './dto/input/engagement.input';
import { IdOnly } from './dto/input/id-only.input';
import {
  AnnouncementList,
  AnnouncementListWithoutSeenBy,
} from './dto/response/announcementlist.response';
import { EngagementResponse } from './dto/response/engagement.response';
import { FileUrl } from './dto/response/fileUrl.response';
import { SignedUrl } from './dto/response/signedUrl.response';
import { TotalDraftCount } from './dto/response/total-draft.response';
import { Announcement } from './entities/announcement.entity';
import { extname } from 'path';
import { AnnouncementPinResponse } from './dto/response/announcement-pin.response';
import { AnnouncementPinInput } from './dto/input/announcement-pin.input';

@Resolver()
export class AnnouncementResolver {
  constructor(private readonly announcementService: AnnouncementService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => AnnouncementList)
  async getCompanyAnnouncements(
    @CurrentUser() user: User,
    @Args('announcementListInput') announcementListInput: AnnouncementListInput,
  ) {
    return this.announcementService.getCompanyAnnouncements(
      user,
      announcementListInput,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => EngagementResponse)
  getEngagementLevel(
    @CurrentUser() user: User,
    @Args('engagementInput') engagementInput: EngagementInput,
  ) {
    return this.announcementService.getEngagementLevel(user, engagementInput);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Message)
  getEngagementLevelCsv(
    @CurrentUser() user: User,
    @Args('engagementInput') engagementInput: EngagementInput,
  ) {
    return this.announcementService.getEngagementLevelCsv(
      user,
      engagementInput,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => AnnouncementListWithoutSeenBy)
  createAnnouncement(
    @CurrentUser() user: User,
    @Args('announcementInput') announcementInput: AnnouncementInput,
  ) {
    return this.announcementService.createAnnouncement(user, announcementInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => AnnouncementListWithoutSeenBy)
  updateAnnouncement(
    @CurrentUser() user: User,
    @Args('announcementInput') announcementInput: AnnouncementEditInput,
  ) {
    return this.announcementService.updateAnnouncement(user, announcementInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => AnnouncementListWithoutSeenBy)
  deleteAnnouncement(
    @CurrentUser() user: User,
    @Args('announcementInput') announcementInput: AnnouncementDeleteInput,
  ) {
    return this.announcementService.deleteAnnouncement(user, announcementInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => FileUrl)
  async uploadAnnouncementFile(
    @Args('file', { type: () => GraphQLUpload }) file: FileUpload,
  ) {
    const extension = extname(file.filename);
    let fileData = await this.announcementService.uploadFile(file);
    if (extension === '.mp4') {
      const thumbnailKey = await this.announcementService.uploadFileThumbnail();
      let response = Object.assign({ thumbnailKey }, fileData);
      return response;
    }
    return fileData;
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => SignedUrl)
  async getSignedUrlFromKey(@Args('key') key: string) {
    return this.announcementService.getSignedUrlFromKey(key);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Announcement)
  async starAnnouncement(
    @CurrentUser() user: User,
    @Args('starAnnouncementInput') starAnnouncement: AnnouncementStarInput,
  ) {
    return this.announcementService.starAnnouncement(user, starAnnouncement);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => TotalDraftCount)
  getDraftAnnouncementCount(
    @CurrentUser() user: User,
    @Args('companyId') companyId: IdOnly,
  ) {
    return this.announcementService.getDraftAnnouncementCount(user, companyId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => AnnouncementListWithoutSeenBy)
  softDeleteAnnouncement(
    @CurrentUser() user: User,
    @Args('announcementInput') announcementInput: AnnouncementDeleteInput,
  ) {
    return this.announcementService.softDeleteAnnouncement(
      user,
      announcementInput,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => AnnouncementListWithoutSeenBy)
  async getCompanyAnnouncement(
    @CurrentUser() user: User,
    @Args('announcementInput') announcementInput: AnnouncementDetailInput,
  ) {
    return this.announcementService.getAnnouncement(user, announcementInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => AnnouncementPinResponse)
  async pinAnnouncement(
    @Args('announcementInput') announcementPinInput: AnnouncementPinInput,
  ) {
    return await this.announcementService.pinAnnouncement(announcementPinInput);
  }
}
