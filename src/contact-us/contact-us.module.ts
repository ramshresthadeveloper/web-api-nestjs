import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactUsResolver } from './contact-us.resolver';
import { ContactUsService } from './contact-us.service';
import { ContactUsSchema, ContactUs } from './entities/contact-us.entity';
import { ContactUsRepository } from './repository/contact-us.respository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContactUs.name, schema: ContactUsSchema },
    ]),
  ],
  providers: [ContactUsResolver, ContactUsService, ContactUsRepository],
})
export class ContactUsModule {}
