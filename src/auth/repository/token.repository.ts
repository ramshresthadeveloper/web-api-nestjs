import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Token, TokenDocument } from '../entities/token.entity';
import { TokenDto } from '../dto/token.dto';

@Injectable()
export class TokenRepository {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
  ) {}

  async create(tokendata: TokenDto): Promise<Token> {
    const createToken = new this.tokenModel(tokendata);
    return await createToken.save();
  }

  async findOne(condition, select = null): Promise<Token> {
    const result = this.tokenModel.findOne(condition).lean();
    if (select) {
      result.select(select);
    }
    return result.exec();
  }

  async deleteOne(condition) {
    return await this.tokenModel.deleteOne(condition);
  }

  async updateOne(condition, data) {
    return await this.tokenModel.findOneAndUpdate(condition, data, {
      new: true,
    });
  }
}
