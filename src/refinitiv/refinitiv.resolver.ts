import { Args, Query, Resolver } from '@nestjs/graphql';
import { AsxTimeSeriesInput } from './dto/input/asxTimeSeries.input';
import { AsxTimeSeriesData } from './dto/response/asxTimeSeries.response';
import { RefinitivService } from './refinitiv.service';

@Resolver()
export class RefinitivResolver {
  constructor(private readonly refinitivService: RefinitivService) {}
}
