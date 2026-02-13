import { MigrationInterface, QueryRunner } from 'typeorm';

export class Appointments1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "appointment_status" AS ENUM (
        'scheduled', 'confirmed', 'checked_in', 'in_progress',
        'completed', 'cancelled', 'no_show'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "appointment_type" AS ENUM (
        'checkup', 'vaccination', 'surgery', 'dental', 'grooming',
        'emergency', 'follow_up', 'lab_work', 'other'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "appointments" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "clientId" uuid NOT NULL REFERENCES "clients"("id") ON DELETE RESTRICT,
        "patientId" uuid NOT NULL REFERENCES "patients"("id") ON DELETE RESTRICT,
        "vetId" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "startTime" timestamptz NOT NULL,
        "endTime" timestamptz NOT NULL,
        "type" "appointment_type" NOT NULL DEFAULT 'checkup',
        "status" "appointment_status" NOT NULL DEFAULT 'scheduled',
        "reason" text,
        "notes" text,
        "cancellationReason" text,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_appointments_time" CHECK ("endTime" > "startTime")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_appointments_clientId" ON "appointments" ("clientId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_appointments_patientId" ON "appointments" ("patientId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_appointments_vetId" ON "appointments" ("vetId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_appointments_startTime" ON "appointments" ("startTime")
    `);
    // Composite index for conflict detection: find overlapping slots per vet
    await queryRunner.query(`
      CREATE INDEX "IDX_appointments_vet_time_range"
        ON "appointments" ("vetId", "startTime", "endTime")
        WHERE "status" NOT IN ('cancelled', 'no_show')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "appointments"`);
    await queryRunner.query(`DROP TYPE "appointment_type"`);
    await queryRunner.query(`DROP TYPE "appointment_status"`);
  }
}
