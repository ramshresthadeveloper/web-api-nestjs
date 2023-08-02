import { EnquiryStatusResponse } from '@enquiry/dto/response/EnquiryStatusResponse';
import { TotalEnquiryResponse } from '@enquiry/dto/response/total-enquiry.response';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Message } from '@src/admin/dto/response/message.response';
import { CurrentUser } from '@src/auth/decorator/user.decorator';
import { GqlAuthGuard } from '@src/auth/guard/auth.guard';
import { User } from '@src/user/entities/user.entity';
import { AssignEnquiriesToCategoriesInput } from '../dto/input/assign-enquiries-to-category.input';
import { AssignEnquiriesToStaff } from '../dto/input/assign-enquiry-to-staff.input';
import { EnquiryDetailInput } from '../dto/input/enquiry-detail.input';
import { EnquiryQuestionListInput } from '../dto/input/enquiry-question-list.input';
import { ExportEnquiryPdfInput } from '../dto/input/export-enquiry-pdf.input';
import { InvestorSatisfactionInput } from '../dto/input/investorSatisfaction.input';
import { NewAndOutstandingQuestionsInput } from '../dto/input/new-outstanding-question.input';
import { ArchiveOrResolveEnquiriesInput } from '../dto/input/archive.or.resolve.enquiries.input';
import {
  EnquiryList,
  EnquiryWithInvestor,
} from '../dto/response/enquiryList.response';
import { InvestorSatisfactionResponse } from '../dto/response/investorSatisfaction.response';
import { NewAndOutstandingQuestionResponse } from '../dto/response/new-outstanding-question.response';
import { TotalUnReadEnquiry } from '../dto/response/total-unread-enquiry.response';
import { EnquiryService } from '../service/enquiry.service';
import * as firebaseAdmin from 'firebase-admin';
import { TestPushNotification } from '@enquiry/dto/response/test.push.notification.response';
import { SendTestPushNotificationInput } from '@enquiry/dto/input/send.test.push.notification.input';
import { EnquiryHistoryResponse } from '@enquiry/dto/response/get.enquiries.history.response';
import { GetEnquiriesHistoryInput } from '@enquiry/dto/input/get.enquiries.history.input';

@Resolver()
export class EnquiryResolver {
  constructor(private readonly enquiryService: EnquiryService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => NewAndOutstandingQuestionResponse)
  async newAndTotalOutstandingQuestions(
    @CurrentUser() user: User,
    @Args('newAndOutstandingQuestionInput')
    newAndOutstandingQuestionInput: NewAndOutstandingQuestionsInput,
  ) {
    return this.enquiryService.getNewQuestionsOfDayAndTotalOutstandings(
      user,
      newAndOutstandingQuestionInput,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => InvestorSatisfactionResponse)
  async investorSatisfaction(
    @CurrentUser() user: User,
    @Args('InvestorSatisfactionInput')
    investorSatisfactionInput: InvestorSatisfactionInput,
  ) {
    return this.enquiryService.getInvestorSatisfaction(
      user,
      investorSatisfactionInput,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => EnquiryList)
  async getEnquiryQuestions(
    @CurrentUser() user: User,
    @Args('enquiryListInput') enquiryListInput: EnquiryQuestionListInput,
  ) {
    return this.enquiryService.getEnquiryQuestions(user, enquiryListInput);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => EnquiryHistoryResponse)
  async getEnquiriesHistory(
    @CurrentUser() user: User,
    @Args('enquiriesHistoryInput')
    enquiriesHistoryInput: GetEnquiriesHistoryInput,
  ) {
    return await this.enquiryService.getEnquiriesHistory(
      user,
      enquiriesHistoryInput,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Message)
  async assignEnquiriesToCategory(
    @CurrentUser() user: User,
    @Args('assignToCategoryInput')
    assignToCategoryInput: AssignEnquiriesToCategoriesInput,
  ) {
    return this.enquiryService.assignEnquiriesToCategories(
      user,
      assignToCategoryInput,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => EnquiryWithInvestor)
  async getEnquiryQuestion(
    @CurrentUser() user: User,
    @Args('enquiryDetailInput') enquiryDetailInput: EnquiryDetailInput,
  ) {
    return this.enquiryService.getEnquiryQuestion(user, enquiryDetailInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Message)
  async resolveEnquiries(
    @CurrentUser() user: User,
    @Args('resolveEnquiriesInput')
    resolveEnquiriesInput: ArchiveOrResolveEnquiriesInput,
  ) {
    return this.enquiryService.resolveEnquiries(user, resolveEnquiriesInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Message)
  async archiveEnquiries(
    @CurrentUser() user: User,
    @Args('archiveEnquiriesInput')
    archiveEnquiriesInput: ArchiveOrResolveEnquiriesInput,
  ) {
    return this.enquiryService.archiveEnquiries(user, archiveEnquiriesInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Message)
  async unarchiveEnquiries(
    @CurrentUser() user: User,
    @Args('unarchiveEnquiriesInput')
    unarchiveEnquiriesInput: ArchiveOrResolveEnquiriesInput,
  ) {
    return this.enquiryService.unarchiveEnquiries(
      user,
      unarchiveEnquiriesInput,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Message)
  async assignEnquiriesToStaff(
    @CurrentUser() user: User,
    @Args('assignEnquiriesToStaff')
    assignEnquiriesToStaff: AssignEnquiriesToStaff,
  ) {
    return this.enquiryService.assignEnquiriesToStaff(
      user,
      assignEnquiriesToStaff,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Message)
  async exportEnquiryPdf(
    @CurrentUser() user: User,
    @Args('exportEnquiryPdfInput') exportEnquiryPdfInput: ExportEnquiryPdfInput,
  ) {
    return this.enquiryService.exportEnquiryPdf(user, exportEnquiryPdfInput);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => TotalUnReadEnquiry)
  async getTotalUnreadQuestions(
    @CurrentUser() user: User,
    @Args('companyId') companyId: string,
  ) {
    return this.enquiryService.getTotalUnreadQuestions(user, companyId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => EnquiryStatusResponse)
  async triggerCustomerJourney() {
    return await this.enquiryService.triggerCustomerJourney();
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => TotalEnquiryResponse)
  async getTotalEnquiryResponse(@Args('companyId') companyId: string) {
    return await this.enquiryService.getTotalEnquiryResponse(companyId);
  }
}
