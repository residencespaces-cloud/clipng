import { Body, Controller, Headers, Post } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { Public } from '../common/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallets/wallet.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private prisma: PrismaService,
    private wallet: WalletService,
    private config: ConfigService,
  ) {}

  private verifyPaystackSignature(payload: string, signature: string | undefined) {
    const secret = this.config.get<string>('PAYSTACK_WEBHOOK_SECRET');
    if (!secret || !signature) return false;
    const hash = crypto.createHmac('sha512', secret).update(payload).digest('hex');
    return hash === signature;
  }

  @Public()
  @Post('paystack')
  async paystack(
    @Body() body: Record<string, unknown>,
    @Headers('x-paystack-signature') signature: string | undefined,
  ) {
    const payload = JSON.stringify(body);
    const isValid = this.verifyPaystackSignature(payload, signature);
    const event = body.event as string;
    const data = body.data as Record<string, unknown> | undefined;
    const reference = (data?.reference as string) ?? `evt_${Date.now()}`;

    const existing = await this.prisma.paymentWebhook.findUnique({ where: { reference } });
    if (existing?.processed) return { received: true };

    await this.prisma.paymentWebhook.upsert({
      where: { reference },
      create: {
        eventType: event ?? 'unknown',
        reference,
        payload: body as Prisma.InputJsonValue,
        processed: false,
      },
      update: {},
    });

    if (!isValid) {
      return { received: true, warning: 'invalid signature' };
    }

    if (event === 'charge.success' && data) {
      const amountKobo = Number(data.amount ?? 0);
      const metadata = (data.metadata as Record<string, unknown>) ?? {};
      await this.wallet.creditTopUp(reference, amountKobo, metadata);
    }

    await this.prisma.paymentWebhook.update({
      where: { reference },
      data: { processed: true, processedAt: new Date() },
    });

    return { received: true };
  }
}
