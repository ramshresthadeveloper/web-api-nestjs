import { Field, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

@InputType()
export class UpdateProfileInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: Lang.FIRST_NAME_REQUIRED })
  firstName: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: Lang.FIRST_NAME_REQUIRED })
  lastName: string;

  @Field({ nullable: true })
  @IsString()
  jobTitle: string;

  @Field()
  @IsString()
  @IsEmail({}, { message: Lang.INVALID_EMAIL })
  @IsNotEmpty({ message: Lang.EMAIL_REQUIRED })
  email: string;

  @Field({ nullable: true })
  @MaxLength(20, {
    message: Lang.MOBILE_MAX_LENGTH,
  })
  @MinLength(10, {
    message: Lang.MOBILE_MIN_LENGTH,
  })
  @IsString()
  @Matches(
    /^(\+?\(61\)|\(\+?61\)|\+?61|\(0[1-9]\)|0[1-9])?( ?-?[0-9]){7,9}$/,
    {
      message: Lang.PROVIDE_VALID_MOBILE,
    },
  )
  @ValidateIf((o) => o.mobileNum)
  @IsOptional()
  mobileNum: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  @ValidateIf((o) => o.attachment)
  profileImage: string;
}
