import { MigrationInterface, QueryRunner } from 'typeorm';

export class VisitsAndEMR1700000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Visit status enum
    await queryRunner.query(`
      CREATE TYPE "visit_status" AS ENUM ('open', 'in_progress', 'completed')
    `);

    // Note type enum
    await queryRunner.query(`
      CREATE TYPE "note_type" AS ENUM ('soap', 'progress', 'procedure', 'discharge', 'general')
    `);

    // Visits table
    await queryRunner.query(`
      CREATE TABLE "visits" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "patientId" uuid NOT NULL REFERENCES "patients"("id") ON DELETE RESTRICT,
        "clientId" uuid NOT NULL REFERENCES "clients"("id") ON DELETE RESTRICT,
        "vetId" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "appointmentId" uuid REFERENCES "appointments"("id") ON DELETE SET NULL,
        "status" "visit_status" NOT NULL DEFAULT 'open',
        "chiefComplaint" text,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_visits_patientId" ON "visits" ("patientId")`);
    await queryRunner.query(`CREATE INDEX "IDX_visits_clientId" ON "visits" ("clientId")`);
    await queryRunner.query(`CREATE INDEX "IDX_visits_createdAt" ON "visits" ("createdAt")`);

    // Vitals table (append-only readings per visit)
    await queryRunner.query(`
      CREATE TABLE "vitals" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "visitId" uuid NOT NULL REFERENCES "visits"("id") ON DELETE RESTRICT,
        "recordedById" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "temperature" decimal(5,1),
        "temperatureUnit" varchar(5) DEFAULT 'F',
        "heartRate" int,
        "respiratoryRate" int,
        "weight" decimal(6,2),
        "weightUnit" varchar(5) DEFAULT 'kg',
        "bodyConditionScore" int CHECK ("bodyConditionScore" BETWEEN 1 AND 9),
        "painScore" int CHECK ("painScore" BETWEEN 0 AND 4),
        "mucousMembraneColor" varchar(20),
        "capillaryRefillTime" int,
        "notes" text,
        "recordedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_vitals_visitId" ON "vitals" ("visitId")`);

    // Clinical notes table (APPEND-ONLY — no updates or deletes)
    await queryRunner.query(`
      CREATE TABLE "clinical_notes" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "visitId" uuid NOT NULL REFERENCES "visits"("id") ON DELETE RESTRICT,
        "authorId" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "noteType" "note_type" NOT NULL DEFAULT 'soap',
        "content" jsonb NOT NULL,
        "correctsNoteId" uuid REFERENCES "clinical_notes"("id"),
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_clinical_notes_visitId" ON "clinical_notes" ("visitId")`);
    await queryRunner.query(`CREATE INDEX "IDX_clinical_notes_createdAt" ON "clinical_notes" ("createdAt")`);

    // Prevent UPDATE and DELETE on clinical_notes via trigger
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION prevent_clinical_note_mutation()
      RETURNS TRIGGER AS $$
      BEGIN
        RAISE EXCEPTION 'Clinical notes are append-only. Updates and deletes are not permitted.';
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_clinical_notes_no_update
        BEFORE UPDATE ON "clinical_notes"
        FOR EACH ROW EXECUTE FUNCTION prevent_clinical_note_mutation()
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_clinical_notes_no_delete
        BEFORE DELETE ON "clinical_notes"
        FOR EACH ROW EXECUTE FUNCTION prevent_clinical_note_mutation()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_clinical_notes_no_delete ON "clinical_notes"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_clinical_notes_no_update ON "clinical_notes"`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS prevent_clinical_note_mutation`);
    await queryRunner.query(`DROP TABLE "clinical_notes"`);
    await queryRunner.query(`DROP TABLE "vitals"`);
    await queryRunner.query(`DROP TABLE "visits"`);
    await queryRunner.query(`DROP TYPE "note_type"`);
    await queryRunner.query(`DROP TYPE "visit_status"`);
  }
}
