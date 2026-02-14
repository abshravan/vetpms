import { MigrationInterface, QueryRunner } from 'typeorm';

export class BillingInvoices1700000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "invoice_status_enum" AS ENUM ('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled', 'refunded')
    `);
    await queryRunner.query(`
      CREATE TYPE "payment_method_enum" AS ENUM ('cash', 'credit_card', 'debit_card', 'check', 'insurance', 'other')
    `);

    await queryRunner.query(`
      CREATE TABLE "invoices" (
        "id"              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        "invoiceNumber"   VARCHAR(20) NOT NULL UNIQUE,
        "clientId"        UUID NOT NULL REFERENCES "clients"("id") ON DELETE RESTRICT,
        "patientId"       UUID REFERENCES "patients"("id") ON DELETE SET NULL,
        "visitId"         UUID REFERENCES "visits"("id") ON DELETE SET NULL,
        "status"          invoice_status_enum NOT NULL DEFAULT 'draft',
        "issueDate"       DATE NOT NULL,
        "dueDate"         DATE,
        "subtotal"        DECIMAL(10,2) NOT NULL DEFAULT 0,
        "taxRate"         DECIMAL(5,2) NOT NULL DEFAULT 0,
        "taxAmount"       DECIMAL(10,2) NOT NULL DEFAULT 0,
        "discountAmount"  DECIMAL(10,2) NOT NULL DEFAULT 0,
        "totalAmount"     DECIMAL(10,2) NOT NULL DEFAULT 0,
        "amountPaid"      DECIMAL(10,2) NOT NULL DEFAULT 0,
        "balanceDue"      DECIMAL(10,2) NOT NULL DEFAULT 0,
        "paymentMethod"   payment_method_enum,
        "paymentDate"     DATE,
        "notes"           TEXT,
        "createdAt"       TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        "updatedAt"       TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_invoices_clientId" ON "invoices"("clientId")`);
    await queryRunner.query(`CREATE INDEX "IDX_invoices_patientId" ON "invoices"("patientId")`);
    await queryRunner.query(`CREATE INDEX "IDX_invoices_status" ON "invoices"("status")`);

    await queryRunner.query(`
      CREATE TABLE "invoice_items" (
        "id"          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        "invoiceId"   UUID NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
        "description" VARCHAR(200) NOT NULL,
        "category"    VARCHAR(50),
        "quantity"    INTEGER NOT NULL DEFAULT 1,
        "unitPrice"   DECIMAL(10,2) NOT NULL,
        "lineTotal"   DECIMAL(10,2) NOT NULL,
        "notes"       TEXT
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_invoice_items_invoiceId" ON "invoice_items"("invoiceId")`);

    // Sequence for invoice numbers
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START WITH 1001`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SEQUENCE IF EXISTS invoice_number_seq`);
    await queryRunner.query(`DROP TABLE IF EXISTS "invoice_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "invoices"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_method_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "invoice_status_enum"`);
  }
}
