import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Message } from '@src/admin/dto/response/message.response';
import { CurrentUser } from '@src/auth/decorator/user.decorator';
import { GqlAuthGuard } from '@src/auth/guard/auth.guard';
import { User } from '@src/user/entities/user.entity';
import { DeleteFaqCategoryInput } from '../dto/input/delete-faq-category.input';
import { CreateFaqCategoryInput } from '../dto/input/faq-category.input';
import { OrderFaqCategoryInput } from '../dto/input/order-faq-category.input';
import { UpdateFaqCategoryInput } from '../dto/input/update-faq-category.input';
import { FaqWithCategoryOutput } from '../dto/output/faq-with-category.output';
import { FaqCategoryWithMessageResponse } from '../dto/response/faqCategory-with-message.response';
import { FaqCategory } from '../entities/faq-category.entity';
import { FaqCategoryService } from '../services/faq-category.service';

@Resolver()
export class FaqCategoryResolver {
  constructor(private readonly faqCategoryService: FaqCategoryService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => FaqCategoryWithMessageResponse)
  async createFaqCategory(
    @Args('createFaqCategoryInput') createFaqCategory: CreateFaqCategoryInput,
    @CurrentUser() user: User,
  ) {
    return this.faqCategoryService.createFaqCategory(createFaqCategory, user);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [FaqCategory])
  async listFaqCategories(
    @CurrentUser() user: User,
    @Args('companyId') companyId: string,
  ) {
    return this.faqCategoryService.listFaqCategories(user, companyId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => FaqCategory)
  async updateFaqCategory(
    @Args('updateFaqCategoryInput') updateFaqCategory: UpdateFaqCategoryInput,
    @CurrentUser() user: User,
  ) {
    return this.faqCategoryService.updateFaqCategory(user, updateFaqCategory);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => FaqCategoryWithMessageResponse)
  async deleteFaqCategory(
    @Args('deleteFaqCategoryInput') deleteFaqCategory: DeleteFaqCategoryInput,
    @CurrentUser() user: User,
  ) {
    return this.faqCategoryService.deleteFaqCategory(user, deleteFaqCategory);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [FaqWithCategoryOutput])
  async listFaqCategoryWithFaqs(
    @CurrentUser() user: User,
    @Args('companyId') companyId: string,
  ) {
    return this.faqCategoryService.listFaqCategoryWithFaqs(user, companyId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Message)
  async orderFaqCategory(
    @CurrentUser() user: User,
    @Args('orderFaqCategoryInput') orderFaqCategoryInput: OrderFaqCategoryInput,
  ) {
    return this.faqCategoryService.orderFaqCategory(
      user,
      orderFaqCategoryInput,
    );
  }
}
