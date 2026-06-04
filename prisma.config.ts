import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const env = process.env;
export default defineConfig({
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env['DATABASE_URL'],
  },
});
