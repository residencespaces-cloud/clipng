import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from '../common/guards/auth.guards';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/campaign.dto';

@Controller('campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CampaignsController {
  constructor(private campaigns: CampaignsService) {}

  @Get('live')
  @Roles(UserRole.clipper)
  listLive() {
    return this.campaigns.listLive();
  }

  @Get('my')
  @Roles(UserRole.funder)
  listMy(@Req() req: { user: { id: string } }) {
    return this.campaigns.listMy(req.user.id);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.campaigns.getById(id);
  }

  @Post()
  @Roles(UserRole.funder)
  create(@Req() req: { user: { id: string } }, @Body() dto: CreateCampaignDto) {
    return this.campaigns.create(req.user.id, dto);
  }

  @Post(':id/join')
  @Roles(UserRole.clipper)
  join(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.campaigns.joinCampaign(req.user.id, id);
  }
}
