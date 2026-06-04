import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthUserService } from './auth.service';
import { AuthUserController } from './auth.controller';
import { AppConfig, appConfigSchema } from '../config/env.schema';
import {
  AUTH_USER_PORT,
  AuthModule,
  AuthModuleOptions,
  AuthPrismaModule,
} from '@interloid/auth';
import { UserAdapter } from '../user/user-adapter';
import { AuthMailListener } from '../user/user-mail';
import { PrismaModule } from '../prisma/prisma.module';
import { TypedConfigService } from '@interloid/config';

export const env = appConfigSchema.parse(process.env);

@Global()
@Module({
  imports: [
    // Register the signing engine
    JwtModule.register({
      global: true, // Makes JwtService available everywhere in your app
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: '1d' }, // Token lasts for 1 day
    }),
    PrismaModule,
    AuthModule.forRootAsync({
      imports: [AuthPrismaModule, AuthUserModule],
      inject: [TypedConfigService],
      useFactory: (...args: unknown[]): AuthModuleOptions => {
        const config = args[0] as TypedConfigService<AppConfig>;

        return {
          jwtSecret: config.getOrThrow('JWT_SECRET'),
          jwtRefreshSecret: config.getOrThrow('JWT_SECRET'),
          accessTokenCookie: 'access_token',
          accessTokenTtl: 900,
          refreshTokenTtl: 604800,
          argon2: {
            memoryCost: 19456,
            timeCost: 2,
            parallelism: 1,
          },
          mfa: {
            enabled: true,
            issuer: 'Interloid',
          },
        };
      },
    }),
  ],
  controllers: [AuthUserController],
  providers: [
    AuthUserService,
    UserAdapter,
    {
      provide: AUTH_USER_PORT,
      useClass: UserAdapter,
    },
    AuthMailListener,
  ],
  exports: [AUTH_USER_PORT, AuthUserModule],
})
export class AuthUserModule {}
