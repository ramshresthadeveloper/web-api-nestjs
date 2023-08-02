import { CurrentUser } from '@auth/decorator/user.decorator';
import { GqlAuthGuard } from '@auth/guard/auth.guard';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ContactUsService } from '@src/contact-us/contact-us.service';
import { User } from '@src/user/entities/user.entity';
import { CreateContactUsDto } from './dto/input/create-contact-us.dto';
import { ContactUs } from './entities/contact-us.entity';

@Resolver()
export class ContactUsResolver {
  constructor(private readonly contactUsService: ContactUsService) { }
  
  @UseGuards(GqlAuthGuard)
  @Mutation(() => ContactUs)
  sendMessageToNestjs(
    @CurrentUser() user: User,
    @Args('contactUs') contactUs: CreateContactUsDto
  ) {
    return this.contactUsService.createContactUs(contactUs, user._id);
  }
}
