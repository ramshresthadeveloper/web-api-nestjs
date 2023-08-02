import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PageDocument = Page & Document;

@ObjectType()
@Schema({ timestamps: true })
export class Page {
  @Field()
  _id: string;

  @Field()
  @Prop({
    type: String,
    required: true,
    unique: true,
    sparse: true,
    index: true,
    trim: true,
  })
  slug: string;

  @Field()
  @Prop({ type: String, required: true })
  title: string;

  @Field()
  @Prop({ type: String, required: true })
  content: string;
}

export const PageSchema = SchemaFactory.createForClass(Page);
