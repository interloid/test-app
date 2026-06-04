import { AuthUser, AuthUserPort } from '@interloid/auth';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserAdapter implements AuthUserPort {
  constructor(private readonly prisma: PrismaService) {}
  async create(input: {
    email: string;
    passwordHash: string;
    profile: { name: string };
  }): Promise<AuthUser> {
    return this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        name: (input.profile?.name as string | undefined) ?? '',
      },
    });
  }
  findByEmail(email: string): Promise<AuthUser | null> {
    const user = this.prisma.user.findUnique({
      where: { email },
    });
    return user;
  }
  async findById(id: string): Promise<AuthUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async markEmailVerified(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        isEmailVerified: true,
      },
    });
  }

  async setMfaEnabled(id: string, enabled: boolean): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        mfaEnabled: enabled,
      },
    });
  }

  async setPasswordHash(id: string, hash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        passwordHash: hash,
      },
    });
  }

  //   async findByEmail(email: string) {
  //     return this.prisma.user.findUnique({
  //       where: { email },
  //     });
  //   }

  //   async create(input: CreateUserInput) {
  //     return this.prisma.user.create({
  //       data: input,
  //     });
  //   }
}
