import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from '../common/guards/auth.guards';
import { CreateSubmissionDto } from './dto/submission.dto';
import { SubmissionsService } from './submissions.service';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubmissionsController {
  constructor(private submissions: SubmissionsService) {}

  @Post('submissions')
  @Roles(UserRole.clipper)
  create(@Req() req: { user: { id: string } }, @Body() dto: CreateSubmissionDto) {
    return this.submissions.create(req.user.id, dto);
  }

  @Get('submissions/me')
  @Roles(UserRole.clipper)
  listMine(@Req() req: { user: { id: string } }) {
    return this.submissions.listMine(req.user.id);
  }

  @Get('earnings/me')
  @Roles(UserRole.clipper)
  earnings(@Req() req: { user: { id: string } }) {
    return this.submissions.getEarningsSummary(req.user.id);
  }
}
