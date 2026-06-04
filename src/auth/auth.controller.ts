import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  Res,
  Patch,
  Req,
} from '@nestjs/common';
import { ZodValidationPipe } from '@interloid/validation';
import {
  loginSchema,
  RegisterDto,
  registerSchema,
  LoginDto,
  updateProfileSchema,
  UpdateProfileDto,
} from './auth.dto';
import { ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentUser, Public } from '@interloid/core';
import { SkipCsrf } from '@interloid/security';
import { AuthService, LoginResult } from '@interloid/auth';
import { AuthUserService } from './auth.service';

@Controller('auth')
export class AuthUserController {
  constructor(
    private readonly authService: AuthService,
    private readonly authUserService: AuthUserService,
  ) {}

  /**
   * POST /auth/register
   * Creates a new user record in PostgreSQL after running through strict Zod constraints.
   * Returns a 201 Created status on success.
   */
  @Post('register')
  @Public()
  @SkipCsrf()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(registerSchema))
  @ApiOperation({ summary: 'Register a new user profile record' })
  @ApiResponse({
    status: 201,
    description: 'User account provisioned successfully.',
  }) // Swagger reads class type definition
  @ApiResponse({
    status: 400,
    description: 'Payload validation constraints failed.',
  })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, {
      name: dto.name,
    });
  }

  @Post('login')
  @SkipCsrf()
  @Public()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(loginSchema))
  @ApiOperation({ summary: 'Authenticate and set secure HttpOnly cookie' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response, // Injects underlying express response context
  ) {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const result: LoginResult = await this.authService.login(
      dto.email,
      dto.password,
      {
        ip,
        userAgent,
      },
    );
    console.log(result);

    return true;
    // Bake the JWT token directly into a secure, HttpOnly browser cookie container
    // response.cookie('access_token', result.accessToken, {
    //   httpOnly: true, // 🔒 Protects against XSS scripts reading your authentication tokens
    //   secure: process.env.NODE_ENV === 'production', // true in prod (requires HTTPS)
    //   sameSite: 'lax', // 🛡️ Standard mitigation setting preventing strict third-party site injections
    //   maxAge: 24 * 60 * 60 * 1000, // Matches your 1-day JWT expiration duration
    // });

    // // Return the user object context cleanly back to the client interface without leaking the token raw
    // return { user: result.user };
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'x-csrf-token',
    required: true, // Makes it a mandatory field in Swagger UI
    schema: { type: 'string' },
  })
  @ApiOperation({ summary: 'Update authenticated user profile name attribute' })
  @ApiResponse({
    status: 200,
    description: 'Profile details updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Payload validation failed.' })
  @ApiResponse({
    status: 404,
    description: 'User account reference not found.',
  })
  async updateName(
    @CurrentUser('userId')
    userId: string,
    // Extract destination target UUID from request URI parameters
    @Body(new ZodValidationPipe(updateProfileSchema)) dto: UpdateProfileDto,
  ) {
    return this.authUserService.updateName(userId, dto);
  }
}
