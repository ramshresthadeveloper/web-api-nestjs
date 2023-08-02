import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Query } from '@nestjs/graphql';

import { CreatePageInput } from '@page-management/dto/input/create.page.input';
import { Page } from '@page-management/entities/page.entity';
import { PageDeleteStatus } from '@page-management/dto/response/delete.page.response';
import { PageService } from '@page-management/service/page.service';
import { PageSlugInput } from '@page-management/dto/input/page.slug.input';
import { Pages } from '@page-management/dto/response/get.pages.response';
import { UpdatePageInput } from '@page-management/dto/input/update.page.input';

@Resolver()
export class PageResolver {
  constructor(private readonly pageService: PageService) {}

  @Query(() => Page)
  async getPage(@Args('body') pageSlugInput: PageSlugInput) {
    return await this.pageService.readPage(pageSlugInput);
  }

  @Query(() => Pages)
  async getPages() {
    return { pages: await this.pageService.getPages() };
  }
  @Mutation(() => Page)
  async createPage(@Args('body') createPageInput: CreatePageInput) {
    return await this.pageService.createPage(createPageInput);
  }

  @Mutation(() => Page)
  async updatePage(@Args('body') updatePageInput: UpdatePageInput) {
    return await this.pageService.updatePage(updatePageInput);
  }

  @Mutation(() => PageDeleteStatus)
  async deletePage(@Args('body') pageSlugInput: PageSlugInput) {
    return await this.pageService.removePage(pageSlugInput);
  }
}
