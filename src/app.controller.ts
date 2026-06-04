import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { SkipCsrf, StrictThrottle } from '@interloid/security';
import { Public } from '@interloid/core';

@Public()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/ping')
  @StrictThrottle('global', 100, 60000)
  getHello() {
    return this.appService.getHello();
  }

  // Mark a route as publicly accessible (no auth required):
  @Get('profile')
  getProfile() {
    return { data: { user: 'guest' } };
  }

  // Skip CSRF protection on this endpoint (cookie-session apps only):
  @SkipCsrf()
  @Post('webhook')
  handleWebhook() {
    return { data: { received: true } };
  }
}
