import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Public } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/auth.guards';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, SignupClipperDto, SignupFunderDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public()
  @Post('signup/clipper')
  signupClipper(@Body() dto: SignupClipperDto) {
    return this.auth.signupClipper(dto);
  }

  @Public()
  @Post('signup/funder')
  signupFunder(@Body() dto: SignupFunderDto) {
    return this.auth.signupFunder(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Public()
  @Post('logout')
  logout(@Body() dto: RefreshTokenDto) {
    return this.auth.logout(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: { user: { id: string } }) {
    return this.auth.getMe(req.user.id);
  }
}
