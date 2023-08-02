import { ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export type TokenDocument = Token & Document;

@ObjectType()
@Schema({ timestamps: true })
export class Token {
  @Prop({ type: String, required: true })
  tokenType: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  invitedUserId: string;

  @Prop({ type: String, required: true })
  token: string;

  @Prop({ type: Date, required: false })
  expiredAt: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
