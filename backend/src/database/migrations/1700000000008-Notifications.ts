import { MigrationInterface, QueryRunner } from 'typeorm';

export class Notifications1700000000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "notification_type_enum" AS ENUM (
        'vaccination_due', 'preventive_care_overdue', 'low_stock',
        'expiring_inventory', 'appointment_reminder', 'invoice_overdue', 'system'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "notification_priority_enum" AS ENUM (
        'low', 'medium', 'high', 'urgent'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "type" "notification_type_enum" NOT NULL,
        "priority" "notification_priority_enum" NOT NULL DEFAULT 'medium',
        "title" varchar(200) NOT NULL,
        "message" text NOT NULL,
        "referenceId" uuid,
        "referenceType" varchar(50),
        "isRead" boolean NOT NULL DEFAULT false,
        "isDismissed" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_notifications_createdAt" ON "notifications" ("createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_type" ON "notifications" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_isRead" ON "notifications" ("isRead")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "notification_priority_enum"`);
    await queryRunner.query(`DROP TYPE "notification_type_enum"`);
  }
}
