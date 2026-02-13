import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for roles
    await queryRunner.query(`
      CREATE TYPE "user_role" AS ENUM ('admin', 'vet', 'tech', 'receptionist')
    `);

    // Users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "firstName" varchar(100) NOT NULL,
        "lastName" varchar(100) NOT NULL,
        "email" varchar(255) NOT NULL,
        "passwordHash" varchar NOT NULL,
        "role" "user_role" NOT NULL DEFAULT 'receptionist',
        "phone" varchar(20),
        "isActive" boolean NOT NULL DEFAULT true,
        "refreshTokenHash" varchar,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email")
    `);

    // Audit logs table (append-only)
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "action" varchar(50) NOT NULL,
        "resource" varchar(100) NOT NULL,
        "resourceId" varchar,
        "userId" varchar,
        "userEmail" varchar(255),
        "details" jsonb,
        "ipAddress" varchar(45),
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_audit_logs_action" ON "audit_logs" ("action")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_audit_logs_userId" ON "audit_logs" ("userId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_audit_logs_createdAt" ON "audit_logs" ("createdAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "user_role"`);
  }
}
