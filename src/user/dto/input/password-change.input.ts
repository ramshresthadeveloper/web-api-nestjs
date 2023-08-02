import { Field, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

@InputType()
export class PasswordChangeInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: Lang.OLD_PASSWORD_REQUIRED })
  oldPassword: string;

  @Field()
  @IsString()
  @Matches(
    /^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/,
    {
      message: Lang.INVALID_NEW_PASSWORD_FORMAT,
    },
  )
  @IsNotEmpty({ message: Lang.NEW_PASSWORD_REQUIRED })
  newPassword: string;
}
