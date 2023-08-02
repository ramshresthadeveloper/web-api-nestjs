import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CounterDocument = Counter & Document;

@Schema()
export class Counter {
  @Prop({
    type: String,
    required: true,
  })
  _id: string;

  @Prop({ type: String, required: true })
  companyId: string;

  @Prop({
    type: Number,
    required: true,
    default: 0,
  })
  seq: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
