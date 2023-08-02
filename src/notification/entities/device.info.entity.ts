import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';

import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export type DeviceInfoDocument = DeviceInfo & Document;

@ObjectType()
@Schema({ timestamps: true })
export class DeviceInfo {
  @Field(() => ID)
  _id: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investor',
    index: true,
    required: true,
  })
  userId: string;

  @Field()
  @Prop({ type: String, required: true })
  firebaseToken: string;

  @Field()
  @Prop({ type: String, required: true, enum: ['ios', 'android'] })
  deviceType: string;

  @Field()
  @Prop({ type: String, required: true })
  deviceId: string;

  @Field({ nullable: true })
  @Prop({ type: String })
  deviceModel: string;

  @Field({ nullable: true })
  @Prop({ type: String })
  deviceBrand: string;
}

export const DeviceInfoSchema = SchemaFactory.createForClass(DeviceInfo);
