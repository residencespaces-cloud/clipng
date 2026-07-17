import { Module } from '@nestjs/common';
import { WalletsModule } from '../wallets/wallets.module';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [WalletsModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
