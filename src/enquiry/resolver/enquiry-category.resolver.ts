import { EnquiryCategoryDeleteInput } from '@enquiry/dto/input/enquiry-category-delete.input';
import { EditEnquiryCategory } from '@enquiry/dto/input/enquiry-category-update.input';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@src/auth/decorator/user.decorator';
import { GqlAuthGuard } from '@src/auth/guard/auth.guard';
import { User } from '@src/user/entities/user.entity';
import { EnquiryCategoryListInput } from '../dto/input/enquiry-category-list.input';
import { CreateEnquiryCategoryInput } from '../dto/input/enquiry-category.input';
import { EnquiryCategoryList } from '../dto/response/enquiryCategoryList.response';
import { EnquiryCategory } from '../entities/enquiry-category.entity';
import { EnquiryCategoryService } from '../service/enquiry-category.service';

@Resolver()
export class EnquiryCategoryResolver {
  constructor(
    private readonly enquiryCategoryService: EnquiryCategoryService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => EnquiryCategory)
  createEnquiryCategory(
    @CurrentUser() user: User,
    @Args('enquiryCategoryInput')
    enquiryCategoryInput: CreateEnquiryCategoryInput,
  ) {
    return this.enquiryCategoryService.createEnquiryCategory(
      user,
      enquiryCategoryInput,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => EnquiryCategory)
  updateEnquiryCategory(
    @CurrentUser() user: User,
    @Args('enquiryCategoryInput')
    enquiryCategoryInput: EditEnquiryCategory,
  ) {
    return this.enquiryCategoryService.updateEnquiryCategory(
      user,
      enquiryCategoryInput,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => EnquiryCategory)
  deleteEnquiryCategory(
    @CurrentUser() user: User,
    @Args('enquiryCategory')
    enquiryCatgory: EnquiryCategoryDeleteInput,
  ) {
    return this.enquiryCategoryService.deleteEnquiryCategory(
      user,
      enquiryCatgory,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => EnquiryCategoryList)
  getEnquiryCategories(
    @CurrentUser() user: User,
    @Args('enquiryCategoryListInput')
    enquiryCategoryListInput: EnquiryCategoryListInput,
  ) {
    return this.enquiryCategoryService.getEnquiryCategories(
      user,
      enquiryCategoryListInput,
    );
  }
}
