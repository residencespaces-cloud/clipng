import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from '../common/guards/auth.guards';
import { WalletService } from './wallet.service';
import { IsNumber, Min } from 'class-validator';

class TopUpDto {
  @IsNumber()
  @Min(100)
  amount!: number;
}

@Controller('wallet')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.funder)
export class WalletController {
  constructor(private wallet: WalletService) {}

  @Get()
  getBalance(@Req() req: { user: { id: string } }) {
    return this.wallet.getBalance(req.user.id);
  }

  @Get('transactions')
  getTransactions(@Req() req: { user: { id: string } }) {
    return this.wallet.getTransactions(req.user.id);
  }

  @Post('topups/initiate')
  initiateTopUp(@Req() req: { user: { id: string } }, @Body() dto: TopUpDto) {
    return this.wallet.initiateTopUp(req.user.id, dto.amount);
  }
}
