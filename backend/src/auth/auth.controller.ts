import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtAuthGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle(5, 60)
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto.email, dto.password, dto.displayName);
    const tokens = await this.authService.createTokens(user.id);
    return { user: { id: user.id, email: user.email, displayName: user.displayName }, ...tokens };
  }

  @Post('login')
  @Throttle(10, 60)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    const tokens = await this.authService.createTokens(user.id);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      domain: process.env.COOKIE_DOMAIN
    });
    return { user: { id: user.id, email: user.email, displayName: user.displayName }, accessToken: tokens.accessToken };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refresh = req.cookies?.refreshToken as string | undefined;
    if (!refresh) {
      return { accessToken: null };
    }
    try {
      const payload = await this.authService.verifyRefreshToken(refresh);
      const tokens = await this.authService.createTokens(payload.sub);
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        domain: process.env.COOKIE_DOMAIN
      });
      return { accessToken: tokens.accessToken };
    } catch {
      return { accessToken: null };
    }
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken', { domain: process.env.COOKIE_DOMAIN });
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    return { userId: (req.user as { userId: string }).userId };
  }
}
