import { Resolver } from '@nestjs/graphql';
import { MorningStarService } from './morning-star.service';

@Resolver()
export class MorningStarResolver {
  constructor(private readonly morningStarService: MorningStarService) {}
}
