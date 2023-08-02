import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type RefinitivDocument = Refinitiv & Document;

@Schema()
export class Refinitiv {
  @Prop({ type: String })
  refinitivToken: string;

  @Prop({ type: String })
  refinitivTokenExpiration: string;
}

export const RefinitivSchema = SchemaFactory.createForClass(Refinitiv);
