import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto, UpdateProfileDto } from './auth.dto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register Logic
   */
  async register(dto: RegisterDto) {
    const emailLower = dto.email.toLowerCase().trim();

    const userExists = await this.prisma['user']['findUnique']({
      where: { email: emailLower },
    });

    if (userExists) {
      throw new ConflictException('An account with this email already exists');
    }

    const hashedPassword = await argon2.hash(dto.password);

    const newUser = await this.prisma['user']['create']({
      data: {
        email: emailLower,
        name: dto.name,
        passwordHash: hashedPassword,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = newUser;
    return result;
  }

  /**
   * Login Logic with Real JWT Generation
   */
  async login(dto: LoginDto) {
    const emailLower = dto.email.toLowerCase().trim();

    // 1. Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: emailLower },
    });

    // 2. Reject early if user doesn't exist
    if (!user) {
      throw new UnauthorizedException('Invalid email or password credentials');
    }

    // 3. Verify database Argon2 hash against input password
    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      dto.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password credentials');
    }

    // 4. Construct the token payload matrix (Keep it lightweight!)
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    // 5. Sign the token and return it alongside public user data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...publicUser } = user;

    return {
      user: publicUser,
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async updateName(userId: string, dto: UpdateProfileDto) {
    // Execute atomic update query matching the Prisma 7 bracket typing syntax
    const updatedUser = await this.prisma['user']['update']({
      where: { id: userId },
      data: { name: dto.name },
    });

    // Strip password hashes from returning payloads safely
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = updatedUser;
    return result;
  }
}
