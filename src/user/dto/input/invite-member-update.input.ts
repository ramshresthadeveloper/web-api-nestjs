import { Field, ID, InputType } from '@nestjs/graphql';
import Lang from '@src/constants/language';
import { IsMongoId, IsNotEmpty, IsOptional, IsString, Length, Matches, IsBoolean } from 'class-validator';

@InputType()
export class InviteMemberUpdateInput {
    @Field(() => ID)
    @IsMongoId({ message: Lang.INVALID_MONGOID })
    userId: string;

    @Field()
    @IsNotEmpty()
    firstName: string;

    @Field()
    @IsNotEmpty()
    lastName: string;

    @Field({ nullable: true })
    @IsOptional()
    mobileNum: string;

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

    @Field({ defaultValue: false })
    @IsBoolean()
    acceptedEmailCommunication: boolean;
}
