export class BaseRepository {
  private readonly collectionName;

  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  async findById(_id: string) {
    return await this.collectionName.findById(_id);
  }

  async create(data) {
    return await this.collectionName.create(data);
  }
}
