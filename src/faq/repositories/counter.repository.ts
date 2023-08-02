import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Counter, CounterDocument } from '../entities/counter.entity';
import { Model } from 'mongoose';

@Injectable()
export class CounterRepository {
  constructor(
    @InjectModel(Counter.name) private counterModel: Model<CounterDocument>,
  ) {}

  async increment(collectionName) {
    return await this.counterModel.findByIdAndUpdate(
      collectionName,
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
  }
}
