import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CsrfService } from '@interloid/security';

@Module({
  imports: [
    // Register the signing engine
    JwtModule.register({
      global: true, // Makes JwtService available everywhere in your app
      secret: process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod',
      signOptions: { expiresIn: '1d' }, // Token lasts for 1 day
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, CsrfService],
})
export class AuthModule {}
