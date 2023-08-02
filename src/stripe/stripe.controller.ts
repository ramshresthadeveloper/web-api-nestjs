import { JwtAuthGuard } from '@auth/guard/auth.guard';
import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Get('/products')
  getStripeProducts() {
    return this.stripeService.getStripeProducts();
  }

  @UseGuards(JwtAuthGuard)
  @Post('/subscribe')
  async subscribe(@Req() req: Request) {
    return this.stripeService.subscribe(req);
  }

  @Post('/webhook')
  async stripeWebhook(@Req() req) {
    return this.stripeService.webHook(req);
  }

  @Get('/order/success')
  async getSuccessOrderDetail(@Req() req) {
    return this.stripeService.getDataForCheckoutSuccessPage(req);
  }
}
