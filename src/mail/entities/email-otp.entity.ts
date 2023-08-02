import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailOtpDocument = EmailOtp & Document;

@Schema()
export class EmailOtp {
  @Prop({ type: String })
  email: string;

  @Prop({ default: null, type: String })
  fingerprint?: string;

  @Prop({ type: Number })
  otpCode: number;

  @Prop({ default: null })
  verifiedAt: Date;

  @Prop({ default: null })
  expiredAt: Date;

  @Prop({ default: 1 })
  resendCount: number;

  @Prop({ type: Date, default: Date.now, expires: '8h' })
  createdAt: Date;
}

export const EmailOtpSchema = SchemaFactory.createForClass(EmailOtp);
