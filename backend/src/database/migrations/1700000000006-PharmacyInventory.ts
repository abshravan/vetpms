import { MigrationInterface, QueryRunner } from 'typeorm';

export class PharmacyInventory1700000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "item_category_enum" AS ENUM (
        'medication', 'vaccine', 'surgical_supply', 'lab_supply',
        'food', 'supplement', 'equipment', 'consumable', 'other'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "item_unit_enum" AS ENUM (
        'tablet', 'capsule', 'ml', 'mg', 'g', 'dose',
        'vial', 'bottle', 'box', 'pack', 'unit', 'other'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "transaction_type_enum" AS ENUM (
        'purchase', 'dispensed', 'adjustment', 'return',
        'expired', 'damaged', 'transfer'
      )
    `);

    // Create inventory_items table
    await queryRunner.query(`
      CREATE TABLE "inventory_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "sku" varchar(50) NOT NULL UNIQUE,
        "name" varchar(200) NOT NULL,
        "description" text,
        "category" "item_category_enum" NOT NULL DEFAULT 'medication',
        "unit" "item_unit_enum" NOT NULL DEFAULT 'unit',
        "manufacturer" varchar(100),
        "supplier" varchar(100),
        "costPrice" decimal(10,2) NOT NULL DEFAULT 0,
        "sellingPrice" decimal(10,2) NOT NULL DEFAULT 0,
        "quantityOnHand" int NOT NULL DEFAULT 0,
        "reorderLevel" int NOT NULL DEFAULT 10,
        "reorderQuantity" int NOT NULL DEFAULT 50,
        "lotNumber" varchar(100),
        "expirationDate" date,
        "location" varchar(100),
        "isActive" boolean NOT NULL DEFAULT true,
        "requiresPrescription" boolean NOT NULL DEFAULT false,
        "isControlledSubstance" boolean NOT NULL DEFAULT false,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_inventory_items_sku" ON "inventory_items" ("sku")`);
    await queryRunner.query(`CREATE INDEX "IDX_inventory_items_category" ON "inventory_items" ("category")`);
    await queryRunner.query(`CREATE INDEX "IDX_inventory_items_name" ON "inventory_items" ("name")`);

    // Create inventory_transactions table
    await queryRunner.query(`
      CREATE TABLE "inventory_transactions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "itemId" uuid NOT NULL,
        "type" "transaction_type_enum" NOT NULL,
        "quantity" int NOT NULL,
        "quantityAfter" int NOT NULL,
        "unitCost" decimal(10,2),
        "patientId" uuid,
        "visitId" uuid,
        "performedById" uuid,
        "reference" varchar(100),
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_inventory_transactions_item" FOREIGN KEY ("itemId")
          REFERENCES "inventory_items" ("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_inventory_transactions_patient" FOREIGN KEY ("patientId")
          REFERENCES "patients" ("id") ON DELETE SET NULL,
        CONSTRAINT "FK_inventory_transactions_visit" FOREIGN KEY ("visitId")
          REFERENCES "visits" ("id") ON DELETE SET NULL,
        CONSTRAINT "FK_inventory_transactions_user" FOREIGN KEY ("performedById")
          REFERENCES "users" ("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_inventory_transactions_itemId" ON "inventory_transactions" ("itemId")`);
    await queryRunner.query(`CREATE INDEX "IDX_inventory_transactions_createdAt" ON "inventory_transactions" ("createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_inventory_transactions_type" ON "inventory_transactions" ("type")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "inventory_transactions"`);
    await queryRunner.query(`DROP TABLE "inventory_items"`);
    await queryRunner.query(`DROP TYPE "transaction_type_enum"`);
    await queryRunner.query(`DROP TYPE "item_unit_enum"`);
    await queryRunner.query(`DROP TYPE "item_category_enum"`);
  }
}
