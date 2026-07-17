import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from '../common/guards/auth.guards';
import { AdminService } from './admin.service';

class ApproveDto {
  @IsBoolean()
  codeVerified!: boolean;
}

class RejectDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

class VerifyViewsDto {
  @IsNumber()
  @Min(1)
  viewCount!: number;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin)
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('submissions/pending')
  listPending() {
    return this.admin.listPending();
  }

  @Get('submissions/awaiting-views')
  listAwaitingViews() {
    return this.admin.listAwaitingViews();
  }

  @Get('payouts/ready')
  listReadyForPayout() {
    return this.admin.listReadyForPayout();
  }

  @Get('payouts')
  listPayouts() {
    return this.admin.listPayouts();
  }

  @Post('submissions/:id/approve')
  approve(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: ApproveDto,
  ) {
    return this.admin.approveSubmission(req.user.id, id, dto.codeVerified);
  }

  @Post('submissions/:id/reject')
  reject(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: RejectDto,
  ) {
    return this.admin.rejectSubmission(req.user.id, id, dto.reason);
  }

  @Post('submissions/:id/verify-views')
  verifyViews(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: VerifyViewsDto,
  ) {
    return this.admin.verifyViews(req.user.id, id, dto.viewCount);
  }

  @Post('payouts/:id/trigger')
  triggerPayout(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.admin.triggerPayout(req.user.id, id);
  }

  @Get('campaigns')
  listCampaigns() {
    return this.admin.listAllCampaigns();
  }

  @Get('audit-logs')
  auditLogs() {
    return this.admin.listAuditLogs();
  }
}
