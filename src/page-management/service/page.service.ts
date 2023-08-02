import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import Lang from '@src/constants/language';
import { CreatePageInput } from '@page-management/dto/input/create.page.input';
import { PageRepository } from '@page-management/repository/page.repository';
import { PageSlugInput } from '@page-management/dto/input/page.slug.input';
import { UpdatePageInput } from '@page-management/dto/input/update.page.input';

@Injectable()
export class PageService {
  constructor(private readonly pageRepository: PageRepository) {}

  async createPage(createPageInput: CreatePageInput) {
    const pageExists = await this.pageRepository.checkPageExists(
      createPageInput.slug,
    );

    if (pageExists) {
      throw new ConflictException(Lang.PAGE_ALREADY_EXISTS);
    }

    return await this.pageRepository.createPage(createPageInput);
  }

  async readPage(pageSlugInput: PageSlugInput) {
    const page = await this.pageRepository.readPage(pageSlugInput);

    if (!page) {
      throw new NotFoundException(Lang.PAGE_NOT_FOUND);
    }

    return page;
  }

  async removePage(pageSlugInput: PageSlugInput) {
    const page = await this.pageRepository.checkPageExists(pageSlugInput.slug);

    if (!page) {
      throw new NotFoundException(Lang.PAGE_NOT_FOUND);
    }

    const response = await this.pageRepository.deletePage(pageSlugInput);

    if (response.deletedCount !== 1) {
      throw new InternalServerErrorException(Lang.CANNOT_DELETE_PAGE);
    }

    return { pageDeleteStatus: Lang.PAGE_DELETED };
  }

  async getPages() {
    return await this.pageRepository.readPages();
  }

  async updatePage(updatePageInput: UpdatePageInput) {
    const page = await this.pageRepository.findPageById(updatePageInput.id);

    if (!page) {
      throw new NotFoundException(Lang.PAGE_NOT_FOUND);
    }

    return await this.pageRepository.updatePage(updatePageInput);
  }
}
