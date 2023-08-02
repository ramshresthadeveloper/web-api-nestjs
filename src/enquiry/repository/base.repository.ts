import { PaginationInput } from '@src/announcement/dto/input/pagination.input';
import Lang from '@src/constants/language';

export class BaseRepository {
  private readonly collectionName;

  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  async findById(_id: string) {
    return await this.collectionName.findById(_id);
  }

  async updateOne(condition, data) {
    return await this.collectionName.findOneAndUpdate(condition, data, {
      new: true,
    });
  }

  async deleteOne(condition) {
    return await this.collectionName.findOneAndDelete(condition);
  }

  async aggregatePaginate(stages = [], paginationInput: PaginationInput) {
    let { limit, page } = paginationInput;

    limit = limit ? limit : Lang.DEFAULT_LIMIT;
    page = page ? page : Lang.DEFAULT_PAGE;

    const skip = (page - 1) * limit;

    stages.push({
      $facet: {
        items: [{ $skip: skip }, { $limit: limit }],
        total: [{ $group: { _id: null, count: { $sum: 1 } } }],
      },
    });

    const response = await this.collectionName.aggregate(stages);

    const { items, total } = response[0];

    const itemCount = items.length;

    const totalItems = total && total[0] ? total[0].count : 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      meta: {
        currentPage: page,
        itemCount,
        itemsPerPage: limit,
        totalItems,
        totalPages,
      },
    };
  }
}
