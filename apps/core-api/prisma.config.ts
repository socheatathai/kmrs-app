import { config as loadEnv } from 'dotenv';

import { defineConfig } from 'prisma/config';

const isProduction = process.env.NODE_ENV === 'production';
const envFilePaths = isProduction
  ? ['.env', '.env.production']
  : ['.env', '.env.local'];

for (const envFilePath of envFilePaths) {
  loadEnv({ path: envFilePath });
}

const fallbackDatabaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://prisma:prisma@localhost:5432/prisma';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Prisma client generation only needs a syntactically valid URL.
    // Falling back here prevents build/install failures before runtime envs exist.
    url: fallbackDatabaseUrl,
  },
});
