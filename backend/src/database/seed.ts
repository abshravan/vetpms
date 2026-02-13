import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'vetpms',
    password: process.env.DB_PASSWORD || 'vetpms_dev_pass',
    database: process.env.DB_NAME || 'vetpms',
  });

  await dataSource.initialize();

  const passwordHash = await bcrypt.hash('admin123!', 12);

  await dataSource.query(
    `
    INSERT INTO "users" ("firstName", "lastName", "email", "passwordHash", "role")
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT ("email") DO NOTHING
  `,
    ['Admin', 'User', 'admin@vetpms.local', passwordHash, 'admin'],
  );

  console.log('Seed complete: admin@vetpms.local / admin123!');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
