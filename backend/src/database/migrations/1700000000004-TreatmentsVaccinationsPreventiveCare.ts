import { MigrationInterface, QueryRunner } from 'typeorm';

export class TreatmentsVaccinationsPreventiveCare1700000000004
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Treatment status & category enums
    await queryRunner.query(`
      CREATE TYPE "treatment_status_enum" AS ENUM ('ordered', 'in_progress', 'completed', 'cancelled')
    `);
    await queryRunner.query(`
      CREATE TYPE "treatment_category_enum" AS ENUM ('medication', 'procedure', 'surgery', 'lab_test', 'imaging', 'fluid_therapy', 'other')
    `);

    // Treatments table
    await queryRunner.query(`
      CREATE TABLE "treatments" (
        "id"                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        "visitId"           UUID NOT NULL REFERENCES "visits"("id") ON DELETE RESTRICT,
        "patientId"         UUID NOT NULL REFERENCES "patients"("id") ON DELETE RESTRICT,
        "administeredById"  UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "category"          treatment_category_enum NOT NULL DEFAULT 'medication',
        "name"              VARCHAR(200) NOT NULL,
        "description"       TEXT,
        "dosage"            VARCHAR(100),
        "dosageUnit"        VARCHAR(50),
        "route"             VARCHAR(100),
        "frequency"         VARCHAR(100),
        "durationDays"      INTEGER,
        "status"            treatment_status_enum NOT NULL DEFAULT 'ordered',
        "notes"             TEXT,
        "cost"              DECIMAL(10,2),
        "createdAt"         TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        "updatedAt"         TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_treatments_visitId" ON "treatments"("visitId")`);
    await queryRunner.query(`CREATE INDEX "IDX_treatments_patientId" ON "treatments"("patientId")`);

    // Vaccination status enum
    await queryRunner.query(`
      CREATE TYPE "vaccination_status_enum" AS ENUM ('scheduled', 'administered', 'missed', 'cancelled')
    `);

    // Vaccinations table
    await queryRunner.query(`
      CREATE TABLE "vaccinations" (
        "id"                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        "patientId"         UUID NOT NULL REFERENCES "patients"("id") ON DELETE RESTRICT,
        "visitId"           UUID REFERENCES "visits"("id") ON DELETE SET NULL,
        "administeredById"  UUID REFERENCES "users"("id") ON DELETE RESTRICT,
        "vaccineName"       VARCHAR(150) NOT NULL,
        "manufacturer"      VARCHAR(100),
        "lotNumber"         VARCHAR(100),
        "expirationDate"    DATE,
        "route"             VARCHAR(50),
        "site"              VARCHAR(50),
        "dateAdministered"  DATE,
        "nextDueDate"       DATE,
        "status"            vaccination_status_enum NOT NULL DEFAULT 'scheduled',
        "notes"             TEXT,
        "cost"              DECIMAL(10,2),
        "createdAt"         TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        "updatedAt"         TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_vaccinations_patientId" ON "vaccinations"("patientId")`);
    await queryRunner.query(`CREATE INDEX "IDX_vaccinations_nextDueDate" ON "vaccinations"("nextDueDate")`);

    // Preventive care type & status enums
    await queryRunner.query(`
      CREATE TYPE "preventive_care_type_enum" AS ENUM ('flea_tick', 'heartworm', 'deworming', 'dental', 'wellness_exam', 'blood_work', 'urinalysis', 'other')
    `);
    await queryRunner.query(`
      CREATE TYPE "preventive_care_status_enum" AS ENUM ('active', 'due', 'overdue', 'completed', 'discontinued')
    `);

    // Preventive care table
    await queryRunner.query(`
      CREATE TABLE "preventive_care" (
        "id"                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        "patientId"         UUID NOT NULL REFERENCES "patients"("id") ON DELETE RESTRICT,
        "careType"          preventive_care_type_enum NOT NULL,
        "name"              VARCHAR(200) NOT NULL,
        "description"       TEXT,
        "productName"       VARCHAR(100),
        "lastAdministered"  DATE,
        "nextDueDate"       DATE,
        "frequencyDays"     INTEGER,
        "status"            preventive_care_status_enum NOT NULL DEFAULT 'active',
        "notes"             TEXT,
        "createdAt"         TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        "updatedAt"         TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_preventive_care_patientId" ON "preventive_care"("patientId")`);
    await queryRunner.query(`CREATE INDEX "IDX_preventive_care_nextDueDate" ON "preventive_care"("nextDueDate")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "preventive_care"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "preventive_care_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "preventive_care_type_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vaccinations"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "vaccination_status_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "treatments"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "treatment_category_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "treatment_status_enum"`);
  }
}
