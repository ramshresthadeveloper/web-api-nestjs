import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = User & Document;

@ObjectType()
@Schema({ timestamps: true })
export class User {
  @Field(() => ID)
  _id: string;

  @Field({ nullable: true })
  @Prop({ type: String, minlength: 1, maxlength: 55, trim: true })
  firstName: string;

  @Field({ nullable: true })
  @Prop({ type: String, minlength: 1, maxlength: 55, trim: true })
  lastName: string;

  @Field({ nullable: true })
  @Prop({
    type: String,
    minlength: 2,
    maxlength: 55,
    trim: true,
    required: false,
  })
  userName: string;

  @Field()
  @Prop({
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({ type: String, trim: true })
  password: string;

  @Field({ nullable: true })
  @Prop({ type: String, trim: true })
  mobileNum: string;

  @Prop()
  googleId: string;

  @Field({ nullable: true })
  @Prop({ type: Date, default: null })
  verifiedAt: Date;

  @Field({ nullable: true })
  @Prop({ type: String })
  profileImage: string;

  @Field({ nullable: true })
  @Prop({ type: Date, default: null })
  lastLoggedInAt: Date;

  @Field()
  @Prop({ type: Boolean, enum: [true, false], default: 'false' })
  acceptedTAndC: boolean;

  @Field({ defaultValue: false })
  @Prop({ type: Boolean, default: 'false' })
  acceptedEmailCommunication: boolean;

  @Field()
  @Prop({
    type: Boolean,
    enum: [true, false],
    default: 'true',
  })
  receiveNotification: boolean;

  @Field({ nullable: true })
  @Prop({ type: String, default: '' })
  jobTitle: string;

  @Field({ nullable: true })
  @Prop({
    type: Boolean,
    enum: [true, false],
    default: 'false',
  })
  registeredWithGoogle: boolean;

  @Field({ nullable: true })
  @Prop({
    type: String,
  })
  stripeCustomerId: string;

  @Field({ nullable: true })
  @Prop({
    type: String,
  })
  plan: string;

  @Field({ nullable: true })
  @Prop({
    type: String,
  })
  subscriptionStatus: string;

  @Field({ nullable: true })
  @Prop({ type: Boolean })
  subscriptionRenewable?: boolean;

  @Field({ defaultValue: false })
  companyCreator: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<User>('save', async function (next) {
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});
