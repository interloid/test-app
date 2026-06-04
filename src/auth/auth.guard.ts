// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { Request } from 'express';
// import { env } from '../main';
// import { IS_PUBLIC_KEY } from '@interloid/core';
// import { Reflector } from '@nestjs/core';

// @Injectable()
// export class JwtAuthGuard implements CanActivate {
//   constructor(
//     private readonly jwtService: JwtService,
//     private readonly reflector: Reflector,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
//       context.getHandler(),
//       context.getClass(),
//     ]);
//     if (isPublic) return true;
//     const request = context.switchToHttp().getRequest<Request>();

//     // Extract the token straight out of your secure HttpOnly cookie array
//     const token = request.cookies?.['access_token'];

//     if (!token) {
//       throw new UnauthorizedException('Authentication token session missing');
//     }

//     try {
//       // Cryptographically verify the token against your JWT secret key
//       const payload = await this.jwtService.verifyAsync(token);

//       // Attach the token data payload to the request context
//       // Your payload contains: { sub: userId, email: string, name: string }
//       request['user'] = payload;
//     } catch {
//       throw new UnauthorizedException(
//         'Invalid or expired authentication session',
//       );
//     }

//     return true;
//   }
// }
