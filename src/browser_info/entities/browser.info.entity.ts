import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type BrowserInfoDocument = BrowserInfo & Document;

@Schema({ timestamps: true })
export class BrowserInfo {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  fingerprint: string;

  @Prop({ type: String, required: false })
  firebaseToken?: string;

  @Prop({ type: String, required: false })
  loggedInCompanyId?: string;

  @Prop({ default: null, required: false })
  expiredAt: Date;

  @Prop({ type: Date, default: Date.now, expires: '30d' })
  createdAt: Date;
}

export const BrowserInfoSchema = SchemaFactory.createForClass(BrowserInfo);
