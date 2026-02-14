import { MigrationInterface, QueryRunner } from 'typeorm';

export class SettingsAndUserManagement1700000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create clinic_settings table (singleton row)
    await queryRunner.query(`
      CREATE TABLE "clinic_settings" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "clinicName" varchar(200) NOT NULL DEFAULT 'Veterinary Clinic',
        "phone" varchar(20),
        "email" varchar(255),
        "website" varchar(255),
        "address" text,
        "city" varchar(100),
        "state" varchar(50),
        "zipCode" varchar(20),
        "country" varchar(100),
        "timezone" varchar(50),
        "currency" varchar(10) NOT NULL DEFAULT 'USD',
        "defaultTaxRate" decimal(5,2) NOT NULL DEFAULT 0,
        "appointmentSlotMinutes" int NOT NULL DEFAULT 30,
        "businessHoursStart" varchar(5) NOT NULL DEFAULT '08:00',
        "businessHoursEnd" varchar(5) NOT NULL DEFAULT '18:00',
        "closedDays" text,
        "invoicePaymentTermsDays" int NOT NULL DEFAULT 30,
        "invoiceFooter" text,
        "logoUrl" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Insert default row
    await queryRunner.query(`
      INSERT INTO "clinic_settings" ("clinicName") VALUES ('Veterinary Clinic')
    `);

    // Add specialty and licenseNumber to users
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "specialty" varchar(100)`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "licenseNumber" varchar(50)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "licenseNumber"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "specialty"`);
    await queryRunner.query(`DROP TABLE "clinic_settings"`);
  }
}
