import { CounterRepository } from '@faq/repositories/counter.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CompanyRepository } from '@src/company/repository/company.repository';
import Lang from '@src/constants/language';
import { User } from '@src/user/entities/user.entity';
import { DeleteFaqInput } from '../dto/input/delete-faq.input';
import { CreateFaqInput } from '../dto/input/faq.input';
import { OrderFaqInput } from '../dto/input/order-faq.input';
import { UpdateFaqInput } from '../dto/input/update-faq.input';
import { FaqCategoryRepository } from '../repositories/faq-category.repository';
import { FaqRepository } from '../repositories/faq.repository';
import { FaqCategoryService } from './faq-category.service';
import { OnboardingChecklistService } from '@src/onboarding-checklist/service/onboarding-checklist.service';

@Injectable()
export class FaqService {
  constructor(
    private readonly faqRepo: FaqRepository,
    private readonly companyRepo: CompanyRepository,
    private readonly faqCategoryService: FaqCategoryService,
    private readonly counterRepo: CounterRepository,
    private readonly onboardingChecklistService: OnboardingChecklistService,
  ) {}

  async createFaq(createFaqInput: CreateFaqInput, user: User) {
    try {
      const { companyId, faqCategoryId } = createFaqInput;

      let { seq } = await this.counterRepo.increment('faqs');

      createFaqInput = Object.assign({ displayOrder: seq }, createFaqInput);

      const company = await this.companyRepo.findOne({
        _id: companyId,
      });
      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.faqCategoryService.canManageFaq(companyId, user._id);
      await this.faqCategoryService.isCompanyValidated(companyId);

      await this.faqCategoryService.findOneFaqCategory(
        faqCategoryId,
        companyId,
      );

      const faq = await this.faqRepo.create(createFaqInput);

      // Update the onboarding checklist data
      const checklistData = {};
      if (faq) {
        checklistData['addFAQ'] = true;
      }
      this.onboardingChecklistService.updateCompanyChecklistData(
        companyId,
        checklistData,
      );

      return {
        message: Lang.FAQ_CREATED,
        faq,
      };
    } catch (err) {
      throw err;
    }
  }

  async listFaqInCategory(user: User, companyId: string) {
    try {
      const company = await this.companyRepo.findOne({
        _id: companyId,
      });

      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.faqCategoryService.checkUserIsInCompany(user._id, companyId);
      await this.faqCategoryService.isCompanyValidated(companyId);

      const result = await this.faqRepo.getFaqGroupedInCategory(companyId);

      return result;
    } catch (err) {
      throw err;
    }
  }

  async updateFaq(user: User, updateFaqInput: UpdateFaqInput) {
    try {
      const { companyId, faqId, question, answer } = updateFaqInput;

      const company = await this.companyRepo.findOne({
        _id: companyId,
      });
      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.faqCategoryService.canManageFaq(companyId, user._id);
      await this.faqCategoryService.isCompanyValidated(companyId);

      const updatedFaq = await this.faqRepo.findOneAndUpdate(
        {
          _id: faqId,
          companyId,
        },
        {
          question,
          answer,
        },
      );

      if (!updatedFaq) {
        throw new NotFoundException(Lang.FAQ_NOT_FOUND);
      }

      return updatedFaq;
    } catch (err) {
      throw err;
    }
  }

  async deleteFaq(user: User, deleteFaqInput: DeleteFaqInput) {
    try {
      const { companyId, faqId } = deleteFaqInput;
      const company = await this.companyRepo.findOne({
        _id: companyId,
      });
      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.faqCategoryService.canManageFaq(companyId, user._id);
      await this.faqCategoryService.isCompanyValidated(companyId);

      const deletedFaq = await this.faqRepo.findOneAndDelete({
        _id: faqId,
        companyId,
      });

      if (!deletedFaq) {
        throw new NotFoundException(Lang.FAQ_NOT_FOUND);
      }

      return {
        message: Lang.FAQ_DELETED,
        faq: deletedFaq,
      };
    } catch (err) {
      throw err;
    }
  }

  async orderFaq(user: User, orderFaqInput: OrderFaqInput) {
    try {
      const { faqId, currentPosition, targetPosition, companyId } =
        orderFaqInput;

      if (targetPosition === currentPosition) {
        return { message: Lang.FAQ_SAME_ORDER_POSTION };
      }

      const company = await this.companyRepo.findOne({
        _id: companyId,
      });
      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.faqCategoryService.canManageFaq(companyId, user._id);
      await this.faqCategoryService.isCompanyValidated(companyId);

      const direction = targetPosition > currentPosition ? 'down' : 'up';

      const faqCategoryToUpdate = await this.faqRepo.findOneAndUpdate(
        { _id: faqId, displayOrder: currentPosition, companyId },
        {
          displayOrder: 0,
        },
      );

      if (!faqCategoryToUpdate) {
        throw new NotFoundException(Lang.FAQ_NOT_FOUND);
      }

      if (direction === 'up') {
        await this.faqRepo.incrementDisplayOrders(
          targetPosition,
          currentPosition,
        );
      } else {
        await this.faqRepo.decrementDisplayOrders(
          targetPosition,
          currentPosition,
        );
      }

      await this.faqRepo.findOneAndUpdate(
        { _id: faqId },
        { displayOrder: targetPosition },
      );
      return {
        message: Lang.FAQ_ORDERED,
      };
    } catch (err) {
      throw err;
    }
  }
}
