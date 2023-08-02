import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

@InputType()
export class UserResetPasswordInput {
  @Field()
  @IsNotEmpty()
  token: string;

  @Field()
  @IsString()
  @Length(8, 55)
  @Matches(
    /^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/,
    {
      message:
        'Password must be minimum 8 characters with 1 uppercase, 1 lowercase, 1 number and 1 special characters.',
    },
  )
  @IsNotEmpty({ message: 'Password is required.' })
  password: string;
}
