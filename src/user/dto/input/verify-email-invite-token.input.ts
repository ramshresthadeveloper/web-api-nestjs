import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNumber, Length } from 'class-validator';

@InputType()
export class VerifyEmailInviteMemberTokenInput {
    @Field()
    token: string;
}
