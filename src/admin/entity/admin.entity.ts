import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type AdminDocument = Admin & Document;

@ObjectType()
@Schema({ timestamps: true })
export class Admin {
  @Field((type) => ID)
  _id: string;

  @Field()
  @Prop({ unique: true, required: true })
  email: string;

  @Field()
  @Prop()
  username: string;

  @Field()
  @Prop({ min: 6, required: true })
  password: string;

  @Field((type) => Boolean)
  @Prop({
    default: false,
  })
  disabled: boolean;

  @Field({ nullable: true })
  @Prop()
  phoneNumber?: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

AdminSchema.pre<Admin>('save', async function (next) {
  if (this.password) {
    this.password = await bcrypt.hash(this.password, Number(10));
  }
  next();
});
