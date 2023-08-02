import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

import * as mongoose from 'mongoose';
import Stripe from 'stripe';
import { Model } from 'mongoose';

import Lang from '@src/constants/language';
import { Company, CompanyDocument } from '@company/entity/company.entity';
import { StripeTransactionService } from '@src/stripe-transactions/service/stripe.transaction.service';
import { User, UserDocument } from '@src/user/entities/user.entity';
@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    private readonly stripeTransactionService: StripeTransactionService,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2020-08-27',
    });
  }
  async getStripeProducts() {
    try {
      let products = await this.stripe.products.search({
        query: "active:'true' AND metadata['diolog_subscription']:'true'",
      });
      let items = [];
      for (let i = 0; i < products.data.length; i++) {
        let product: any = products.data[i];
        product.pricelist = await this.stripe.prices.retrieve(
          product.default_price,
          {
            expand: ['tiers'],
          },
        );
        items.push(product);
      }
      products.data = items;
      return products;
    } catch (err) {
      throw err;
    }
  }

  async createCustomer(customerData) {
    try {
      return await this.stripe.customers.create(customerData);
    } catch (err) {
      return err;
    }
  }
  async getCustomerByEmail(email) {
    try {
      return await this.stripe.customers.search({
        query: "email:'" + email + "'",
      });
    } catch (err) {
      return err;
    }
  }
  async getCustomerByID(id) {
    try {
      return await this.stripe.customers.retrieve(id);
    } catch (err) {
      return null;
    }
  }
  async createOrRetriveCustomer(
    stripeCustomerId = null,
    email = null,
    name = null,
    companyName,
  ) {
    let customer;
    if (stripeCustomerId) {
      customer = await this.getCustomerByID(stripeCustomerId);
    }
    if ((!customer || customer.deleted === true) && email) {
      let searchresult = await this.getCustomerByEmail(email);
      if (searchresult.data.length > 0) {
        customer = searchresult.data[0];
      }
    }
    if (!customer || customer.deleted === true) {
      const customerData = {
        email: email,
        description: 'New Customer',
        name: name,
        metadata: { 'Company Name': companyName },
      };
      customer = await this.createCustomer(customerData);
    }
    return customer;
  }
  async checkSubscription(customerStripeId) {
    const result = await this.stripe.subscriptions.list({
      customer: customerStripeId,
    });
    if (result.data.length > 0) {
      return result.data[0];
    }
    return null;
  }
  async createCheckoutSession(stripeSessionData) {
    return await this.stripe.checkout.sessions.create(stripeSessionData);
  }
  async createBillingPortalSession(customerStripeId) {
    const configurationID = await this.getConfigurationID();
    return await this.stripe.billingPortal.sessions.create({
      customer: customerStripeId,
      configuration: configurationID,
      return_url: `${this.configService.get('WEB_APP_URL')}/dashboard`,
    });
  }

  async getConfigurationID() {
    try {
      let configurationID = null;
      const configurations =
        await this.stripe.billingPortal.configurations.list();
      if (configurations && configurations.data.length > 0) {
        const configuration: any = configurations.data[0];
        if (configuration.features.subscription_update.enabled) {
          await this.createOrUpdateConfiguration(configuration.id);
        }
        configurationID = configuration.id;
      } else {
        configurationID = await this.createOrUpdateConfiguration();
      }
      return configurationID;
    } catch (err) {
      return err;
    }
  }
  async createOrUpdateConfiguration(configurationId = null) {
    let products = await this.getStripeProducts();
    if (products.data.length > 0) {
      let productData: any = products.data[0];
      const configurationData: any = {
        features: {
          customer_update: {
            allowed_updates: ['email', 'tax_id'],
            enabled: true,
          },
          invoice_history: { enabled: true },
          payment_method_update: { enabled: true },
          subscription_cancel: { enabled: true },
          subscription_pause: { enabled: true },
          subscription_update: {
            default_allowed_updates: ['quantity'],
            enabled: true,
            products: [
              {
                product: productData.id,
                prices: [productData.default_price],
              },
            ],
          },
        },
        business_profile: {
          privacy_policy_url:
            'https://www.diolog.com.au/help-articles/privacy-policy',
          terms_of_service_url:
            'https://www.diolog.com.au/help-articles/mobile-application-terms-of-use',
        },
      };
      if (configurationId) {
        await this.stripe.billingPortal.configurations.update(
          configurationId,
          configurationData,
        );
      } else {
        const configuration =
          await this.stripe.billingPortal.configurations.update(
            configurationId,
            configurationData,
          );
        configurationId = configuration.id;
      }
    }
    return configurationId;
  }

  async getInvoicePdfUrl(invoiceId: string) {
    const invoiceDetails = await this.stripe.invoices.retrieve(invoiceId);
    if (!invoiceDetails) {
      return;
    }
    return {
      invoicePdfUrl: invoiceDetails.invoice_pdf,
      invoiceNumber: invoiceDetails.number,
    };
  }

  async webHook(req) {
    try {
      let eventType;
      const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
      let event;
      if (webhookSecret) {
        const signature = req.headers['stripe-signature'];
        try {
          event = await this.stripe.webhooks.constructEvent(
            req.body,
            signature,
            webhookSecret,
          );
        } catch (err) {
          return err;
        }
        eventType = event.type;
      } else {
        throw new BadRequestException();
      }
      const subscription = event.data.object;
      switch (eventType) {
        case 'checkout.session.completed':
          await this.checkoutCompleted(subscription);
          break;
        case 'customer.subscription.updated':
          await this.subscriptionUpdated(subscription);
          break;
        case 'customer.subscription.deleted':
          await this.subscriptionDeleted(subscription);
          break;
        case 'setup_intent.succeeded':
          await this.chargeCustomerIfNotPaidAfterAddingCardDetails(
            subscription,
          );
          break;
        default:
          break;
      }
      return 'ok';
    } catch (err) {
      throw err;
    }
  }
  async chargeCustomerIfNotPaidAfterAddingCardDetails(subscription) {
    try {
      const activeSubscription = await this.stripe.subscriptions.list({
        limit: 1,
        customer: subscription.customer,
      });
      if (activeSubscription.data[0].status == 'past_due') {
        const invoiceItem = await this.stripe.invoices.pay(
          activeSubscription.data[0].latest_invoice.toString(),
        );
      }
    } catch (err) {
      throw err;
    }
  }

  async checkoutCompleted(data) {
    try {
      const subscription: any = await this.stripe.subscriptions.retrieve(
        data.subscription,
      );
      const product = await this.stripe.products.retrieve(
        subscription.plan.product,
      );
      await this.userModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(data.client_reference_id),
        },
        {
          stripeCustomerId: data.customer,
          subscriptionStatus: 'active',
          plan: product.name,
          renewable:
            subscription.status === Lang.ACTIVE && !subscription.cancel_at
              ? true
              : false,
        },
      );
      const changes = {
        id: subscription.id,
        startDate: new Date(subscription.current_period_start * 1000),
        endDate: new Date(subscription.current_period_end * 1000),
        activationDate: new Date(subscription.start_date * 1000),
        status: subscription.status,
        plan: product.name,
        stripeCustomerId: subscription.customer,
        renewable:
          subscription.status === Lang.ACTIVE && !subscription.cancel_at
            ? true
            : false,
      };
      await this.companyModel.findOneAndUpdate(
        {
          userId: new mongoose.Types.ObjectId(data.client_reference_id),
        },
        {
          subscription: changes,
        },
        {
          new: true,
        },
      );
    } catch (err) {
      throw err;
    }
  }

  async subscriptionUpdated(subscription) {
    try {
      const stripeCustomerId = subscription.customer;

      const product = await this.stripe.products.retrieve(
        subscription.items.data[0].price.product.toString(),
      );
      const user = await this.userModel.findOneAndUpdate(
        {
          stripeCustomerId,
        },
        {
          subscriptionStatus: subscription.status,
          plan: product.name,
          renewable:
            subscription.status === Lang.ACTIVE && !subscription.cancel_at
              ? true
              : false,
        },
        { new: true },
      );
      let endDataTemp;
      if (subscription.status == 'past_due') {
        endDataTemp = new Date(subscription.trial_end * 1000);
      } else {
        endDataTemp = new Date(subscription.current_period_end * 1000);
      }

      const changes = {
        id: subscription.id,
        startDate: new Date(subscription.current_period_start * 1000),
        endDate: endDataTemp,
        activationDate: new Date(subscription.start_date * 1000),
        status: subscription.status,
        plan: product.name,
        stripeCustomerId: subscription.customer,
        renewable:
          subscription.status === Lang.ACTIVE && !subscription.cancel_at
            ? true
            : false,
      };

      await this.companyModel.findOneAndUpdate(
        {
          userId: user._id,
        },
        {
          subscription: changes,
        },
        { new: true },
      );
      let updatedPlan: string;
      let updatedType: string;
      let updatedAmount: string | null;

      const previousTransaction =
        await this.stripeTransactionService.getLatestTransaction({
          id: stripeCustomerId,
        });

      const { invoicePdfUrl, invoiceNumber } = await this.getInvoicePdfUrl(
        subscription.latest_invoice,
      );

      if (!previousTransaction && !subscription.cancel_at) {
        return await this.stripeTransactionService.createTransaction({
          transactionId: invoiceNumber,
          stripeCustomerId: subscription.customer.toString(),
          amount: subscription.plan.amount,
          type: Lang.ACTIVATE,
          invoicePdfUrl,
          planName: product.name.includes('Premium')
            ? Lang.PREMIUM
            : Lang.BASIC,
        });
      }

      if (subscription.cancel_at) {
        updatedPlan = Lang.FREE;
        updatedType = Lang.CANCEL;
        updatedAmount = null;
      }

      if (!subscription.cancel_at) {
        updatedPlan = product.name.includes('Basic')
          ? Lang.BASIC
          : Lang.PREMIUM;

        updatedAmount = subscription.plan.amount;
        const previousPlan = previousTransaction?.planName;

        if (updatedPlan !== previousPlan) {
          if (previousPlan === Lang.FREE) updatedType = Lang.UPGRADE;
          if (previousPlan === Lang.BASIC) updatedType = Lang.UPGRADE;
          if (previousPlan === Lang.PREMIUM) updatedType = Lang.DOWNGRADE;
        }

        if (updatedPlan === previousPlan) {
          updatedType = Lang.RENEW;
        }
      }

      await this.stripeTransactionService.createTransaction({
        transactionId: invoiceNumber,
        stripeCustomerId,
        amount: updatedAmount,
        type: updatedType,
        invoicePdfUrl,
        planName: updatedPlan,
      });
    } catch (err) {
      throw err;
    }
  }

  async subscriptionDeleted(subscription) {
    try {
      const product = await this.stripe.products.retrieve(
        subscription.items.data[0].price.product.toString(),
      );
      const user = await this.userModel.findOneAndUpdate(
        {
          stripeCustomerId: subscription.customer,
        },
        {
          subscriptionStatus: subscription.status,
          plan: product.name,
        },
        { new: true },
      );

      const changes = {
        id: subscription.id,
        startDate: new Date(subscription.current_period_start * 1000),
        endDate: new Date(subscription.current_period_end * 1000),
        activationDate: new Date(subscription.start_date * 1000),
        status: subscription.status,
        plan: product.name,
      };
      await this.companyModel.findOneAndUpdate(
        {
          userId: user._id,
        },
        {
          subscription: changes,
        },
        { new: true },
      );
    } catch (err) {
      throw err;
    }
  }

  async subscribe(req) {
    let returnUrl;
    const { body, user } = req;
    const company = await this.companyModel.findOne({ userId: user._id });
    const customer = await this.createOrRetriveCustomer(
      user.stripeCustomerId,
      user.email,
      user.firstName + ' ' + user.lastName,
      company.legalBusinessName,
    );
    if (customer) {
      const checkSubscription = await this.checkSubscription(customer.id);
      if (checkSubscription) {
        const billingPortalSession = await this.createBillingPortalSession(
          customer.id,
        );
        returnUrl = billingPortalSession.url;
      } else {
        const createCheckoutSessionData = {
          success_url: `${this.configService.get(
            'WEB_APP_URL',
          )}/dashboard?type=stripe_success`,
          cancel_url: `${this.configService.get(
            'WEB_APP_URL',
          )}/dashboard?type=stripe_failure`,
          client_reference_id: user._id.toString(),
          mode: 'subscription',
          subscription_data: {
            trial_period_days: company.trialDays,
          },
          line_items: [
            {
              price: body.priceId,
              quantity: body.userBaseRange,
            },
          ],
          customer: customer.id,
          payment_method_types: ['card'],
          payment_method_collection: 'if_required',
        };
        const checkoutsession = await this.createCheckoutSession(
          createCheckoutSessionData,
        );
        returnUrl = checkoutsession.url;
      }
    }
    return { url: returnUrl };
  }
  async getDataForCheckoutSuccessPage(req) {
    try {
      if (!req.query.session_id) {
        throw new BadRequestException('Session id not in query params.');
      }
      const session = await this.stripe.checkout.sessions.retrieve(
        req.query.session_id,
      );
      if (!session) {
        throw new NotFoundException('Checkout session not found.');
      }
      const customer = await this.stripe.customers.retrieve(
        session.customer.toString(),
      );

      return {
        customer,
      };
    } catch (err) {
      throw err;
    }
  }
}
