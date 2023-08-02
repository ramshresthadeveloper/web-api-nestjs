import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyModule } from '@src/company/company.module';
import {
  Counter,
  CounterDocument,
  CounterSchema,
} from './entities/counter.entity';
import { FaqCategory, FaqCategorySchema } from './entities/faq-category.entity';
import { Faq, FaqSchema } from './entities/faq.entity';
import { FaqCategoryRepository } from './repositories/faq-category.repository';
import { FaqRepository } from './repositories/faq.repository';
import { FaqCategoryResolver } from './resolvers/faq-category.resolver';
import { FaqResolver } from './resolvers/faq.resolver';
import { FaqCategoryService } from './services/faq-category.service';
import { FaqService } from './services/faq.service';
import { Model } from 'mongoose';
import { CounterRepository } from './repositories/counter.repository';
import { OnboardingChecklistModule } from '@src/onboarding-checklist/onboarding-checklist.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Faq.name,
        useFactory: (counterRepo: CounterRepository) => {
          const schema = FaqSchema;

          schema.post('validate', async function () {
            if (!this.isNew) {
              return;
            }
            const displayOrder = await counterRepo.increment('faqs');
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: Unreachable code error
            this.displayOrder = displayOrder.seq;
          });

          return schema;
        },
        inject: [CounterRepository],
      },
      {
        name: FaqCategory.name,
        imports: [FaqModule],
        useFactory: (
          faqRepo: FaqRepository,
          counterRepo: CounterRepository,
        ) => {
          const schema = FaqCategorySchema;

          schema.post('validate', async function () {
            if (!this.isNew) {
              return;
            }
            // console.log(this);
            const displayOrder = await counterRepo.increment('faqcategories');
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: Unreachable code error
            this.displayOrder = displayOrder.seq;
          });

          schema.post<FaqCategory>(
            'deleteOne',
            { document: true },
            async function () {
              await faqRepo.deleteFaqsOfFaqCategory(this._id);
            },
          );

          return schema;
        },
        inject: [FaqRepository, CounterRepository],
      },
      {
        name: Counter.name,
        useFactory: () => {
          const schema = CounterSchema;
          return schema;
        },
      },
    ]),
    forwardRef(() => CompanyModule),
    forwardRef(() => OnboardingChecklistModule),
  ],
  providers: [
    FaqService,
    FaqCategoryService,
    FaqCategoryRepository,
    FaqCategoryResolver,
    FaqRepository,
    FaqResolver,
    CounterRepository,
  ],
  exports: [FaqRepository, CounterRepository],
})
export class FaqModule {}
