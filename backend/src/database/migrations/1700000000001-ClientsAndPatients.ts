import { MigrationInterface, QueryRunner } from 'typeorm';

export class ClientsAndPatients1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Species enum
    await queryRunner.query(`
      CREATE TYPE "species" AS ENUM ('dog', 'cat', 'bird', 'rabbit', 'reptile', 'horse', 'other')
    `);

    // Sex enum
    await queryRunner.query(`
      CREATE TYPE "sex" AS ENUM ('male', 'female', 'male_neutered', 'female_spayed', 'unknown')
    `);

    // Clients table
    await queryRunner.query(`
      CREATE TABLE "clients" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "firstName" varchar(100) NOT NULL,
        "lastName" varchar(100) NOT NULL,
        "email" varchar(255) NOT NULL,
        "phone" varchar(20) NOT NULL,
        "alternatePhone" varchar(20),
        "address" text,
        "city" varchar(100),
        "state" varchar(50),
        "zipCode" varchar(20),
        "notes" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_clients_email" ON "clients" ("email")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_clients_lastName" ON "clients" ("lastName")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_clients_phone" ON "clients" ("phone")
    `);

    // Patients table
    await queryRunner.query(`
      CREATE TABLE "patients" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "clientId" uuid NOT NULL REFERENCES "clients"("id") ON DELETE RESTRICT,
        "name" varchar(100) NOT NULL,
        "species" "species" NOT NULL,
        "breed" varchar(100),
        "color" varchar(50),
        "sex" "sex" NOT NULL DEFAULT 'unknown',
        "dateOfBirth" date,
        "weight" decimal(6,2),
        "weightUnit" varchar(10) DEFAULT 'kg',
        "microchipNumber" varchar(50),
        "insuranceProvider" varchar(50),
        "insurancePolicyNumber" varchar(50),
        "allergies" text,
        "notes" text,
        "photoUrl" varchar,
        "isActive" boolean NOT NULL DEFAULT true,
        "isDeceased" boolean NOT NULL DEFAULT false,
        "deceasedDate" date,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_patients_clientId" ON "patients" ("clientId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_patients_species" ON "patients" ("species")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_patients_name" ON "patients" ("name")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_patients_microchipNumber" ON "patients" ("microchipNumber") WHERE "microchipNumber" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "patients"`);
    await queryRunner.query(`DROP TABLE "clients"`);
    await queryRunner.query(`DROP TYPE "sex"`);
    await queryRunner.query(`DROP TYPE "species"`);
  }
}
