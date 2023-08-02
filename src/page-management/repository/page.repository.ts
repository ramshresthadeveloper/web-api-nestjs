import { UpdatePageInput } from './../dto/input/update.page.input';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { CreatePageInput } from '@page-management/dto/input/create.page.input';
import { PageDocument, Page } from '@page-management/entities/page.entity';
import { PageSlugInput } from '@page-management/dto/input/page.slug.input';

@Injectable()
export class PageRepository {
  constructor(
    @InjectModel(Page.name) private readonly pageModel: Model<PageDocument>,
  ) {}

  async createPage(createPageInput: CreatePageInput) {
    const newPage = new this.pageModel(createPageInput);

    return await newPage.save();
  }

  async checkPageExists(slug: string) {
    return await this.pageModel.findOne({ slug });
  }

  async readPage(pageSlugInput: PageSlugInput) {
    return await this.pageModel.findOne({ slug: pageSlugInput.slug });
  }

  async deletePage(pageSlutInput: PageSlugInput) {
    return await this.pageModel.deleteOne({ slug: pageSlutInput.slug });
  }

  async readPages() {
    return await this.pageModel.find();
  }

  async updatePage(updatePageInput: UpdatePageInput) {
    const { id, slug, title, content } = updatePageInput;

    return await this.pageModel.findByIdAndUpdate(
      id,
      {
        slug,
        title,
        content,
      },
      { new: true },
    );
  }

  async findPageById(id: string) {
    return await this.pageModel.findById(id);
  }
}
