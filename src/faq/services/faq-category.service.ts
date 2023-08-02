import { CounterRepository } from '@faq/repositories/counter.repository';
import { FaqRepository } from '@faq/repositories/faq.repository';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CompanyRepository } from '@src/company/repository/company.repository';
import Lang from '@src/constants/language';
import { User } from '@src/user/entities/user.entity';
import { DeleteFaqCategoryInput } from '../dto/input/delete-faq-category.input';
import { CreateFaqCategoryInput } from '../dto/input/faq-category.input';
import { OrderFaqCategoryInput } from '../dto/input/order-faq-category.input';
import { UpdateFaqCategoryInput } from '../dto/input/update-faq-category.input';
import { FaqCategory } from '../entities/faq-category.entity';
import { FaqCategoryRepository } from '../repositories/faq-category.repository';

@Injectable()
export class FaqCategoryService {
  constructor(
    private readonly faqCategoryRepo: FaqCategoryRepository,
    private readonly faqRepo: FaqRepository,
    private readonly companyRepo: CompanyRepository,
    private readonly counterRepo: CounterRepository,
  ) {}

  async checkUserIsInCompany(userId, companyId) {
    try {
      const userBelongsToCompany =
        await this.companyRepo.checkIfUserBelongsToCompany(userId, companyId);

      if (!userBelongsToCompany) {
        throw new ForbiddenException();
      }
    } catch (err) {
      throw err;
    }
  }

  async canManageFaq(companyId, userId) {
    try {
      const hasAdministrativePermission =
        await this.companyRepo.hasAdministrativePermission(companyId, userId);

      if (!hasAdministrativePermission) {
        throw new ForbiddenException();
      }
    } catch (err) {
      throw err;
    }
  }

  async isCompanyValidated(companyId) {
    try {
      const validated = await this.companyRepo.isCompanyValidated(companyId);

      if (!validated) {
        throw new UnprocessableEntityException(Lang.COMPANY_NOT_VALIDATED);
      }
    } catch (err) {
      throw err;
    }
  }

  async createFaqCategory(
    createFaqCategoryInput: CreateFaqCategoryInput,
    user: User,
  ) {
    try {
      const { companyId } = createFaqCategoryInput;

      let { seq } = await this.counterRepo.increment('faqcategories');

      createFaqCategoryInput = Object.assign(
        { displayOrder: seq },
        createFaqCategoryInput,
      );

      const company = await this.companyRepo.findOne({
        _id: companyId,
      });
      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.canManageFaq(companyId, user._id);
      await this.isCompanyValidated(companyId);

      const faqCategory = await this.faqCategoryRepo.create(
        createFaqCategoryInput,
      );

      return {
        message: Lang.FAQ_CATEGORY_CREATED,
        faqCategory,
      };
    } catch (err) {
      throw err;
    }
  }

  async findOneFaqCategory(faqCategoryId, companyId): Promise<FaqCategory> {
    try {
      await this.isCompanyValidated(companyId);

      const faqCategory = await this.faqCategoryRepo.findOne({
        _id: faqCategoryId,
        companyId,
      });

      if (!faqCategory) {
        throw new NotFoundException(Lang.FAQ_CATEGORY_NOT_FOUND);
      }

      return faqCategory;
    } catch (err) {
      throw err;
    }
  }

  async listFaqCategories(user: User, companyId) {
    try {
      const company = await this.companyRepo.findOne({
        _id: companyId,
      });
      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.checkUserIsInCompany(user._id, companyId);
      await this.isCompanyValidated(companyId);

      return await this.faqCategoryRepo.findMany({
        companyId,
      });
    } catch (errr) {
      throw errr;
    }
  }

  async updateFaqCategory(
    user: User,
    updateFaqCategoryData: UpdateFaqCategoryInput,
  ) {
    try {
      const { companyId, name, faqCategoryId } = updateFaqCategoryData;
      const company = await this.companyRepo.findOne({
        _id: companyId,
      });
      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.canManageFaq(companyId, user._id);
      await this.isCompanyValidated(companyId);

      const updatedFaqCategory = await this.faqCategoryRepo.findOneAndUpdate(
        {
          _id: faqCategoryId,
          companyId,
        },
        {
          name,
        },
      );
      if (!updatedFaqCategory) {
        throw new NotFoundException(Lang.FAQ_CATEGORY_NOT_FOUND);
      }

      return updatedFaqCategory;
    } catch (err) {
      throw err;
    }
  }

  async listFaqCategoryWithFaqs(user: User, companyId: string) {
    try {
      const company = await this.companyRepo.findOne({
        _id: companyId,
      });

      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.checkUserIsInCompany(user._id, companyId);
      await this.isCompanyValidated(companyId);

      const result = await this.faqCategoryRepo.getFaqCategoryWithFaqs(
        companyId,
      );

      return result;
    } catch (err) {
      throw err;
    }
  }

  async deleteFaqCategory(
    user: User,
    deleteFaqCategoryInput: DeleteFaqCategoryInput,
  ) {
    try {
      const { faqCategoryId, companyId } = deleteFaqCategoryInput;
      const company = await this.companyRepo.findOne({
        _id: companyId,
      });
      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.canManageFaq(companyId, user._id);
      await this.isCompanyValidated(companyId);

      const deletedFaqCategory = await this.faqCategoryRepo.findOneAndDelete({
        _id: faqCategoryId,
      });
      await this.faqRepo.bulkDelete({
        faqCategoryId,
      })
      return {
        message: Lang.FAQ_CATEGORY_DELETED,
        faqCategory: deletedFaqCategory,
      };
    } catch (err) {
      throw err;
    }
  }

  async orderFaqCategory(
    user: User,
    orderFaqCategoryInput: OrderFaqCategoryInput,
  ) {
    try {
      const { faqCategoryId, currentPosition, targetPosition, companyId } =
        orderFaqCategoryInput;

      if (targetPosition === currentPosition) {
        return { message: Lang.FAQ_CATEGORY_SAME_ORDER_POSTION };
      }

      const company = await this.companyRepo.findOne({
        _id: companyId,
      });
      if (!company) {
        throw new NotFoundException(Lang.COMPANY_NOT_FOUND);
      }

      await this.canManageFaq(companyId, user._id);
      await this.isCompanyValidated(companyId);

      const direction = targetPosition > currentPosition ? 'down' : 'up';

      const faqCategoryToUpdate = await this.faqCategoryRepo.findOneAndUpdate(
        { _id: faqCategoryId, displayOrder: currentPosition, companyId },
        {
          displayOrder: 0,
        },
      );

      if (!faqCategoryToUpdate) {
        throw new NotFoundException(Lang.FAQ_CATEGORY_NOT_FOUND);
      }
      if (direction === 'up') {
        await this.faqCategoryRepo.incrementDisplayFaqCategoryOrders(
          targetPosition,
          currentPosition,
        );
      } else {
        await this.faqCategoryRepo.decerementDisplayFaqCategoryOrders(
          targetPosition,
          currentPosition,
        );
      }

      await this.faqCategoryRepo.findOneAndUpdate(
        { _id: faqCategoryId },
        {
          displayOrder: targetPosition,
        },
      );

      return {
        message: Lang.FAQ_CATEGORY_ORDERED,
      };
    } catch (err) {
      throw err;
    }
  }
}
