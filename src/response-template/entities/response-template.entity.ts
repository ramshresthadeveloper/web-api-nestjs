import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export type ResponseTemplateDocument = ResponseTemplate & Document;

@ObjectType()
@Schema({ timestamps: true })
export class ResponseTemplate {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  })
  companyId: string;

  @Field()
  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Field({ nullable: true })
  @Prop({ type: String, required: false, trim: true })
  content?: string;

  @Field(() => [String], { defaultValue: [] })
  @Prop({
    type: [String],
    validate: {
      validator: (value) => Promise.resolve(value.length <= 5),
      message: 'Upto 5 images can be uploaded',
    },
  })
  attachments: string[];

  @Field()
  @Prop({ type: Boolean, default: false })
  starred: string;

  @Field()
  @Prop({ type: Boolean, default: false })
  deleted: string;

  @Field({ nullable: true })
  updatedAt: Date;
}

export const ResponseTemplateSchema =
  SchemaFactory.createForClass(ResponseTemplate);
