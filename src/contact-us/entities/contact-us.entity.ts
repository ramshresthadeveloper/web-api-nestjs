import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type ContactUsDocument = ContactUs & Document;

@ObjectType()
@Schema({ timestamps: true })
export class ContactUs {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Field()
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  subject: string;

  @Field()
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  message: string;

  @Prop({ type: Boolean, default: false })
  hasRead: boolean;
}

export const ContactUsSchema = SchemaFactory.createForClass(ContactUs);
