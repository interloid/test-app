import { AuthEvents } from '@interloid/auth';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class AuthMailListener {
  @OnEvent(AuthEvents.PasswordResetRequested)
  async onReset(payload: { email: string; token: string }) {
    console.log(payload);
  }
}
