import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Page, PageSchema } from '@page-management/entities/page.entity';
import { PageRepository } from '@page-management/repository/page.repository';
import { PageResolver } from '@page-management/resolver/page.resolver';
import { PageService } from '@page-management/service/page.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Page.name, schema: PageSchema }]),
  ],

  providers: [PageResolver, PageRepository, PageService],
})
export class PageManagementModule {}
