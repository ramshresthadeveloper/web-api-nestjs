import { PaginationInput } from '@announcement/dto/input/pagination.input';
import { InputType } from '@nestjs/graphql';

@InputType()
export class ActivityListInput extends PaginationInput {}
