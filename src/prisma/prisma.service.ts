import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { TypedConfigService } from '@interloid/config';
import { AppConfig } from '../config/env.schema';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: TypedConfigService<AppConfig>) {
    const adapter = new PrismaPg({
      connectionString: config.get('DATABASE_URL'),
    });
    super({ adapter });
  }
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
