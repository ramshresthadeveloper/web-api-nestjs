import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Issue, IssueDocument } from '@feedback/entities/issue.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class FeedbackRepository extends BaseRepository {
  constructor(
    @InjectModel(Issue.name)
    private readonly issueModel: Model<IssueDocument>,
  ) {
    super(issueModel);
  }

  async create(contactUsPayload): Promise<Issue> {
    return await this.issueModel.create(contactUsPayload);
  }
}
