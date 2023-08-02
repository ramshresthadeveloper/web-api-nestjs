import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { User } from '@src/user/entities/user.entity';
import { Document } from 'mongoose';
import {
  Announcement,
  AnnouncementDocument,
} from '@announcement/entities/announcement.entity';

export type CompanyDocument = Company & Document;

// geo location
@ObjectType()
class GeoLocation {
  @Field()
  @Prop({
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point',
  })
  type: string;

  @Field(() => [Float])
  @Prop({
    type: [Number],
  })
  coordinates: [number];
}

// team permission
@ObjectType()
@Schema()
export class TeamPermission {
  @Field({ nullable: true })
  @Prop({
    type: String,
    enum: [
      'createEvent',
      'questionManagement',
      'inviteStaff',
      'administrative',
    ],
  })
  name: string;

  @Field({ nullable: true })
  @Prop({ type: Boolean, default: false })
  allowed: boolean;
}
const TeamPermissionSchema = SchemaFactory.createForClass(TeamPermission);

// team member
@ObjectType()
@Schema()
export class TeamMember {
  @Field(() => ID, { nullable: true })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true,
  })
  userId: string;

  @Field({ nullable: true })
  @Prop({
    type: Boolean,
    required: false,
    default: false,
  })
  invitationAccepted: boolean;

  @Field(() => [TeamPermission], { nullable: true })
  @Prop({ type: [TeamPermissionSchema] })
  permissions: TeamPermission[];

  @Field({ nullable: true })
  @Prop({
    type: String,
    trim: true,
  })
  jobTitle: string;
}

const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);

@ObjectType()
@Schema()
export class UnseenMonthlyQuestionPromptCount {
  @Field(() => ID)
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    index: true,
    required: true,
  })
  userId: string;

  @Field()
  @Prop({
    type: Number,
    default: 0,
  })
  count: number;
}

const UnseenMonthlyQuestionPromptCountSchema = SchemaFactory.createForClass(
  UnseenMonthlyQuestionPromptCount,
);

// permissions
@ObjectType()
export class Permissions {
  @Field()
  canCreateEvent: boolean;

  @Field()
  canManageQuestion: boolean;

  @Field()
  canInviteTeamMembers: boolean;

  @Field()
  hasAdministrativeControl: boolean;
}

// subscription
@ObjectType()
@Schema({ timestamps: true })
export class Subscription {
  @Field({ nullable: true })
  @Prop({
    type: String,
  })
  id: string;

  @Field({ nullable: true })
  @Prop({
    type: Date,
  })
  startDate?: Date;

  @Field({ nullable: true })
  @Prop({
    type: Date,
  })
  endDate?: Date;

  @Field({ nullable: true })
  @Prop({
    type: Date,
  })
  activationDate?: Date;

  @Field({ nullable: true })
  @Prop({
    type: String,
  })
  status: string;

  @Field({ nullable: true })
  @Prop({
    type: String,
  })
  plan: string;

  @Prop({ type: Boolean, nullable: true })
  hasTrial?: boolean;

  @Field({ nullable: true })
  @Prop({
    type: String,
  })
  stripeCustomerId: string;

  // subscription  status must be active and cancel_at null to be renewable
  @Field({ nullable: true })
  @Prop({ type: Boolean })
  renewable?: boolean;
}

const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

// company
@ObjectType()
@Schema({ timestamps: true })
export class Company {
  constructor(
    @InjectModel(Announcement.name)
    public readonly announcementModel: Model<AnnouncementDocument>,
  ) {}

  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true,
  })
  userId: string;

  @Field()
  @Prop({
    type: String,
    minlength: 1,
    maxlength: 100,
    trim: true,
    required: true,
    unique: true,
  })
  legalBusinessName: string;

  @Field({ nullable: true })
  @Prop({
    type: String,
    minlength: 1,
    required: false,
    trim: true,
  })
  email: string;

  @Field({ nullable: true })
  @Prop({
    type: String,
    required: false,
    minlength: 5,
    maxlength: 20,
    trim: true,
  })
  phoneNumber: string;

  @Field()
  @Prop({
    type: String,
    trim: true,
    required: true,
  })
  addressLineOne: string;

  @Field({ nullable: true })
  @Prop({
    type: String,
    trim: true,
    required: false,
  })
  addressLineTwo: string;

  @Field()
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  suburb: string;

  @Field()
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  state: string;

  @Field()
  @Prop({
    type: Number,
    required: true,
    trim: true,
  })
  postCode: number;

  @Field({ nullable: true })
  @Prop({
    type: String,
    required: false,
    trim: true,
  })
  websiteUrl: string;

  @Field({ nullable: true })
  @Prop({
    type: String,
    required: false,
    trim: true,
  })
  about: string;

  @Field()
  @Prop({
    type: Number,
    required: true,
    trim: true,
  })
  abn: number;

  @Field({ nullable: true })
  @Prop({
    type: String,
    trim: true,
  })
  asxCode: string;

  @Field({ nullable: true })
  @Prop({
    type: String,
    required: false,
    trim: true,
  })
  optionalBusinessName?: string;

  @Field({ nullable: true })
  @Prop({
    type: Date,
    required: false,
    trim: true,
  })
  verifiedAt?: Date;

  @Field({ nullable: true })
  @Prop({
    type: Boolean,
    required: false,
    default: false,
  })
  disabled?: boolean;

  @Field(() => [TeamMember], { nullable: true })
  @Prop({
    type: [TeamMemberSchema],
  })
  teamMembers: TeamMember[];

  @Field({ nullable: true })
  @Prop({
    type: String,
    required: false,
    trim: true,
  })
  companyLogo: string;

  @Field({ nullable: true })
  @Prop({
    type: Boolean,
    required: false,
    default: false,
  })
  validated: boolean;

  @Field(() => GeoLocation, { nullable: true })
  @Prop({
    type: GeoLocation,
    required: false,
    trim: true,
  })
  location: GeoLocation;

  @Field({ nullable: true })
  permissions: Permissions;

  @Field({ defaultValue: false })
  companyCreator: boolean;

  @Field(() => Subscription, { nullable: true })
  @Prop({
    type: SubscriptionSchema,
    required: false,
  })
  subscription?: Subscription;

  @Field({ nullable: true })
  @Prop({
    type: String,
    required: false,
    trim: true,
  })
  teamName: string;

  @Field({ nullable: true })
  @Prop({
    type: Number,
    required: true,
    trim: true,
    default: 30,
  })
  trialDays: number;

  @Field({ nullable: true, defaultValue: false })
  @Prop({
    type: Boolean,
  })
  isRegistered: boolean;

  @Field({ nullable: true, defaultValue: false })
  @Prop({
    type: Boolean,
  })
  activateCron: boolean;

  @Field({ nullable: true })
  @Prop({
    type: Boolean,
  })
  isAnnouncementConnected: boolean;

  @Field(() => [UnseenMonthlyQuestionPromptCount], { nullable: true })
  @Prop({
    type: [UnseenMonthlyQuestionPromptCountSchema],
  })
  unseenMonthlyQuestionPromptCount?: UnseenMonthlyQuestionPromptCount[];

  @Field({ nullable: true, defaultValue: false })
  @Prop({
    type: Boolean,
    default: false,
  })
  isInviteTeamSkipped: boolean;

  @Field({ nullable: false, defaultValue: 0 })
  @Prop({
    type: Number,
    default: 0,
  })
  totalCompanyViews: number;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
