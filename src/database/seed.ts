import { readFileSync } from 'fs';
import { NestFactory } from '@nestjs/core';
import { Client } from 'pg';
import { AppModule } from '../app.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  await prepareDevelopmentSchema();

  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);
  const result = await seedService.run();

  console.log('Seed completed:', result);
  await app.close();
}

void bootstrap();

async function prepareDevelopmentSchema() {
  const env = readEnvFile();
  const client = new Client({
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  });

  await client.connect();

  await client.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'permissions'
          AND column_name = 'name'
          AND data_type = 'USER-DEFINED'
      ) THEN
        ALTER TABLE "permissions"
        ALTER COLUMN "name" TYPE varchar
        USING "name"::text;
      END IF;
    END $$;
  `);

  await client.end();
}

function readEnvFile() {
  return Object.fromEntries(
    readFileSync('.env', 'utf8')
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.startsWith('#'))
      .map((line) => {
        const separatorIndex = line.indexOf('=');
        return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)];
      }),
  );
}
