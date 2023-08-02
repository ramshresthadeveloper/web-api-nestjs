import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Message } from '@src/admin/dto/response/message.response';
import { CurrentUser } from '@src/auth/decorator/user.decorator';
import { GqlAuthGuard } from '@src/auth/guard/auth.guard';
import { User } from '@src/user/entities/user.entity';
import { DeleteFaqInput } from '../dto/input/delete-faq.input';
import { CreateFaqInput } from '../dto/input/faq.input';
import { OrderFaqInput } from '../dto/input/order-faq.input';
import { UpdateFaqInput } from '../dto/input/update-faq.input';
import { FaqWithCategoryOutput } from '../dto/output/faq-with-category.output';
import { FaqWithMessageResponse } from '../dto/response/faq-with-message.response';
import { Faq } from '../entities/faq.entity';
import { FaqService } from '../services/faq.service';

@Resolver()
export class FaqResolver {
  constructor(private readonly faqService: FaqService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => FaqWithMessageResponse)
  async createFaq(
    @CurrentUser() user: User,
    @Args('createFaqInput') createFaqInput: CreateFaqInput,
  ) {
    return this.faqService.createFaq(createFaqInput, user);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [FaqWithCategoryOutput])
  async listFaqInCategory(
    @CurrentUser() user: User,
    @Args('companyId') companyId: string,
  ) {
    return this.faqService.listFaqInCategory(user, companyId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Faq)
  async updateFaq(
    @Args('updateFaqInput') updateFaq: UpdateFaqInput,
    @CurrentUser() user: User,
  ) {
    return this.faqService.updateFaq(user, updateFaq);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => FaqWithMessageResponse)
  async deleteFaq(
    @Args('deleteFaqInput') deleteFaq: DeleteFaqInput,
    @CurrentUser() user: User,
  ) {
    return this.faqService.deleteFaq(user, deleteFaq);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Message)
  async orderFaq(
    @CurrentUser() user: User,
    @Args('orderFaqInput') orderFaqInput: OrderFaqInput,
  ) {
    return this.faqService.orderFaq(user, orderFaqInput);
  }
}
