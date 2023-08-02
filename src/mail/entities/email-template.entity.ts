import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

export type EmailTemplateDocument = EmailTemplate & Document;

@ObjectType()
@Schema()
export class EmailTemplate {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ type: String, required: true, trim: true })
  slug: string;

  @Field()
  @Prop({ type: String, required: true, trim: true })
  subject: string;

  @Field()
  @Prop({ type: String, required: true, trim: true })
  content: string;

  @Field()
  @Prop({ type: String, trim: true })
  footer: string;
}

export const EmailTemplateSchema = SchemaFactory.createForClass(EmailTemplate);
