import { Field, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

@InputType()
export class UserRegisterInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: Lang.FIRST_NAME_REQUIRED })
  firstName: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: Lang.LAST_NAME_REQUIRED })
  lastName: string;

  @Field()
  @IsString()
  @IsEmail({}, { message: Lang.INVALID_EMAIL })
  @IsNotEmpty({ message: Lang.EMAIL_REQUIRED })
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'fingerprint is required.' })
  fingerprint: string;

  //   Passwords will contain at least 1 upper case letter
  //   Passwords will contain at least 1 lower case letter
  //   Passwords will contain at least 1 number or special character
  //   Password must contain at least 8 characters
  @Field()
  @IsString()
  @Length(8, 55)
  @Matches(
    /^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/,
    {
      message: Lang.INVALID_PASSWORD_FORMAT,
    },
  )
  @IsNotEmpty({ message: Lang.PASSWORD_REQUIRED })
  password: string;

  @Field()
  @IsBoolean()
  acceptedTAndC: boolean;

  @Field({defaultValue:false})
  @IsBoolean()
  acceptedEmailCommunication: boolean;
}
