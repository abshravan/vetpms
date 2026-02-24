import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(private readonly dataSource: DataSource) {}

  async seedDemoData() {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      // ──── 1. Users (staff) ────
      const passwordHash = await bcrypt.hash('demo1234', 12);

      const users = [
        { firstName: 'Sarah', lastName: 'Mitchell', email: 'sarah.mitchell@vetpms.demo', role: 'admin', specialty: 'Practice Manager' },
        { firstName: 'James', lastName: 'Carter', email: 'james.carter@vetpms.demo', role: 'vet', specialty: 'Small Animal Medicine' },
        { firstName: 'Emily', lastName: 'Park', email: 'emily.park@vetpms.demo', role: 'vet', specialty: 'Surgery & Orthopedics' },
        { firstName: 'Lisa', lastName: 'Nguyen', email: 'lisa.nguyen@vetpms.demo', role: 'technician', specialty: 'Dental Care' },
        { firstName: 'Mark', lastName: 'Davis', email: 'mark.davis@vetpms.demo', role: 'receptionist', specialty: null },
      ];

      const userIds: string[] = [];
      for (const u of users) {
        const [row] = await qr.query(
          `INSERT INTO "users" ("firstName","lastName","email","passwordHash","role","specialty","isActive")
           VALUES ($1,$2,$3,$4,$5,$6,true) ON CONFLICT ("email") DO UPDATE SET "firstName"=$1 RETURNING id`,
          [u.firstName, u.lastName, u.email, passwordHash, u.role, u.specialty],
        );
        userIds.push(row.id);
      }

      const vetId1 = userIds[1]; // Dr. Carter
      const vetId2 = userIds[2]; // Dr. Park

      // ──── 2. Clients ────
      const clients = [
        { firstName: 'Michael', lastName: 'Johnson', email: 'michael.j@example.com', phone: '(555) 234-5678', city: 'Springfield', state: 'IL', address: '142 Oak Avenue', zipCode: '62701' },
        { firstName: 'Amanda', lastName: 'Williams', email: 'amanda.w@example.com', phone: '(555) 345-6789', city: 'Springfield', state: 'IL', address: '88 Maple Drive', zipCode: '62702' },
        { firstName: 'Robert', lastName: 'Garcia', email: 'robert.g@example.com', phone: '(555) 456-7890', city: 'Chatham', state: 'IL', address: '305 Pine Street', zipCode: '62629' },
        { firstName: 'Jessica', lastName: 'Brown', email: 'jessica.b@example.com', phone: '(555) 567-8901', city: 'Rochester', state: 'IL', address: '12 Elm Court', zipCode: '62563' },
        { firstName: 'David', lastName: 'Martinez', email: 'david.m@example.com', phone: '(555) 678-9012', city: 'Springfield', state: 'IL', address: '700 Cedar Lane', zipCode: '62703' },
        { firstName: 'Sarah', lastName: 'Anderson', email: 'sarah.a@example.com', phone: '(555) 789-0123', city: 'Springfield', state: 'IL', address: '29 Birch Rd', zipCode: '62704' },
        { firstName: 'Chris', lastName: 'Taylor', email: 'chris.t@example.com', phone: '(555) 890-1234', city: 'Sherman', state: 'IL', address: '415 Walnut Blvd', zipCode: '62684' },
        { firstName: 'Karen', lastName: 'Thomas', email: 'karen.t@example.com', phone: '(555) 901-2345', city: 'Springfield', state: 'IL', address: '63 Ash Way', zipCode: '62701' },
      ];

      const clientIds: string[] = [];
      for (const c of clients) {
        const [row] = await qr.query(
          `INSERT INTO "clients" ("firstName","lastName","email","phone","city","state","address","zipCode","isActive")
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true) ON CONFLICT ("email") DO UPDATE SET "firstName"=$1 RETURNING id`,
          [c.firstName, c.lastName, c.email, c.phone, c.city, c.state, c.address, c.zipCode],
        );
        clientIds.push(row.id);
      }

      // ──── 3. Patients ────
      const patients = [
        { clientIdx: 0, name: 'Buddy', species: 'dog', breed: 'Golden Retriever', sex: 'male_neutered', dob: '2019-03-15', weight: 32, color: 'Golden', allergies: 'Chicken' },
        { clientIdx: 0, name: 'Luna', species: 'cat', breed: 'Siamese', sex: 'female_spayed', dob: '2021-07-22', weight: 4.2, color: 'Seal Point', allergies: null },
        { clientIdx: 1, name: 'Max', species: 'dog', breed: 'German Shepherd', sex: 'male', dob: '2020-11-10', weight: 38, color: 'Black & Tan', allergies: null },
        { clientIdx: 1, name: 'Whiskers', species: 'cat', breed: 'Maine Coon', sex: 'male_neutered', dob: '2018-05-01', weight: 6.8, color: 'Tabby', allergies: 'Penicillin' },
        { clientIdx: 2, name: 'Bella', species: 'dog', breed: 'Labrador Retriever', sex: 'female_spayed', dob: '2022-01-20', weight: 28, color: 'Chocolate', allergies: null },
        { clientIdx: 3, name: 'Charlie', species: 'dog', breed: 'Beagle', sex: 'male_neutered', dob: '2020-09-08', weight: 12, color: 'Tricolor', allergies: null },
        { clientIdx: 3, name: 'Mittens', species: 'cat', breed: 'Persian', sex: 'female_spayed', dob: '2019-12-14', weight: 4.5, color: 'White', allergies: null },
        { clientIdx: 4, name: 'Rocky', species: 'dog', breed: 'Boxer', sex: 'male', dob: '2021-04-03', weight: 30, color: 'Fawn', allergies: 'Beef' },
        { clientIdx: 5, name: 'Daisy', species: 'dog', breed: 'Poodle', sex: 'female_spayed', dob: '2020-06-18', weight: 7.5, color: 'Apricot', allergies: null },
        { clientIdx: 5, name: 'Tweety', species: 'bird', breed: 'Cockatiel', sex: 'unknown', dob: '2022-08-10', weight: 0.09, color: 'Lutino', allergies: null },
        { clientIdx: 6, name: 'Thor', species: 'dog', breed: 'Rottweiler', sex: 'male_neutered', dob: '2019-10-25', weight: 45, color: 'Black & Mahogany', allergies: null },
        { clientIdx: 7, name: 'Cleo', species: 'cat', breed: 'Abyssinian', sex: 'female', dob: '2023-02-14', weight: 3.2, color: 'Ruddy', allergies: null },
        { clientIdx: 7, name: 'Slinky', species: 'reptile', breed: 'Ball Python', sex: 'male', dob: '2021-06-01', weight: 1.8, color: 'Normal', allergies: null },
      ];

      const patientIds: string[] = [];
      for (const p of patients) {
        const [row] = await qr.query(
          `INSERT INTO "patients" ("clientId","name","species","breed","sex","dateOfBirth","weight","weightUnit","color","allergies","isActive","isDeceased")
           VALUES ($1,$2,$3,$4,$5,$6,$7,'kg',$8,$9,true,false) ON CONFLICT DO NOTHING RETURNING id`,
          [clientIds[p.clientIdx], p.name, p.species, p.breed, p.sex, p.dob, p.weight, p.color, p.allergies],
        );
        if (row) patientIds.push(row.id);
      }

      // If patients already existed, fetch them
      if (patientIds.length < patients.length) {
        const existing = await qr.query(`SELECT id FROM "patients" ORDER BY "createdAt" ASC`);
        patientIds.length = 0;
        for (const r of existing) patientIds.push(r.id);
      }

      // ──── 4. Appointments (next 7 days + some past) ────
      const now = new Date();
      const dayOffset = (d: number, h: number, m = 0) => {
        const dt = new Date(now);
        dt.setDate(dt.getDate() + d);
        dt.setHours(h, m, 0, 0);
        return dt.toISOString();
      };

      const appointments = [
        // Today
        { patientIdx: 0, clientIdx: 0, vet: vetId1, start: dayOffset(0, 9, 0), end: dayOffset(0, 9, 30), type: 'checkup', status: 'completed', reason: 'Annual wellness exam' },
        { patientIdx: 2, clientIdx: 1, vet: vetId1, start: dayOffset(0, 10, 0), end: dayOffset(0, 10, 30), type: 'vaccination', status: 'checked_in', reason: 'Rabies booster' },
        { patientIdx: 5, clientIdx: 3, vet: vetId2, start: dayOffset(0, 11, 0), end: dayOffset(0, 11, 45), type: 'dental', status: 'scheduled', reason: 'Dental cleaning' },
        { patientIdx: 7, clientIdx: 4, vet: vetId1, start: dayOffset(0, 14, 0), end: dayOffset(0, 14, 30), type: 'checkup', status: 'scheduled', reason: 'Skin allergy follow-up' },
        // Tomorrow
        { patientIdx: 1, clientIdx: 0, vet: vetId2, start: dayOffset(1, 9, 0), end: dayOffset(1, 9, 30), type: 'checkup', status: 'scheduled', reason: 'Weight check' },
        { patientIdx: 4, clientIdx: 2, vet: vetId1, start: dayOffset(1, 10, 30), end: dayOffset(1, 11, 0), type: 'vaccination', status: 'confirmed', reason: 'DHPP vaccine' },
        { patientIdx: 8, clientIdx: 5, vet: vetId2, start: dayOffset(1, 13, 0), end: dayOffset(1, 13, 30), type: 'grooming', status: 'scheduled', reason: 'Nail trim & grooming' },
        // Day after
        { patientIdx: 10, clientIdx: 6, vet: vetId1, start: dayOffset(2, 9, 0), end: dayOffset(2, 10, 0), type: 'surgery', status: 'scheduled', reason: 'Lipoma removal' },
        { patientIdx: 3, clientIdx: 1, vet: vetId2, start: dayOffset(2, 11, 0), end: dayOffset(2, 11, 30), type: 'lab_work', status: 'scheduled', reason: 'Blood panel - senior screening' },
        // Past (yesterday)
        { patientIdx: 6, clientIdx: 3, vet: vetId1, start: dayOffset(-1, 9, 0), end: dayOffset(-1, 9, 30), type: 'checkup', status: 'completed', reason: 'Eye discharge' },
        { patientIdx: 11, clientIdx: 7, vet: vetId2, start: dayOffset(-1, 10, 0), end: dayOffset(-1, 10, 30), type: 'vaccination', status: 'completed', reason: 'Kitten vaccines' },
        // Past (-3 days)
        { patientIdx: 0, clientIdx: 0, vet: vetId1, start: dayOffset(-3, 14, 0), end: dayOffset(-3, 14, 30), type: 'follow_up', status: 'completed', reason: 'Post-op check' },
      ];

      const appointmentIds: string[] = [];
      for (const a of appointments) {
        const [row] = await qr.query(
          `INSERT INTO "appointments" ("clientId","patientId","vetId","startTime","endTime","type","status","reason")
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
          [clientIds[a.clientIdx], patientIds[a.patientIdx], a.vet, a.start, a.end, a.type, a.status, a.reason],
        );
        appointmentIds.push(row.id);
      }

      // ──── 5. Visits (for completed appointments) ────
      const visitData = [
        { patientIdx: 0, clientIdx: 0, vet: vetId1, apptIdx: 0, status: 'completed', complaint: 'Annual wellness exam' },
        { patientIdx: 6, clientIdx: 3, vet: vetId1, apptIdx: 9, status: 'completed', complaint: 'Eye discharge — left eye' },
        { patientIdx: 11, clientIdx: 7, vet: vetId2, apptIdx: 10, status: 'completed', complaint: 'Kitten vaccination series' },
        { patientIdx: 0, clientIdx: 0, vet: vetId1, apptIdx: 11, status: 'completed', complaint: 'Post-op suture check' },
      ];

      const visitIds: string[] = [];
      for (const v of visitData) {
        const [row] = await qr.query(
          `INSERT INTO "visits" ("patientId","clientId","vetId","appointmentId","status","chiefComplaint")
           VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
          [patientIds[v.patientIdx], clientIds[v.clientIdx], v.vet, appointmentIds[v.apptIdx], v.status, v.complaint],
        );
        visitIds.push(row.id);
      }

      // ──── 6. Vitals for visits ────
      const vitals = [
        { visitIdx: 0, temp: 101.3, hr: 88, rr: 18, weight: 32, bcs: 6, pain: 0, mm: 'Pink', crt: 1.5 },
        { visitIdx: 1, temp: 102.1, hr: 160, rr: 28, weight: 4.5, bcs: 5, pain: 1, mm: 'Pink', crt: 1.0 },
        { visitIdx: 2, temp: 101.8, hr: 180, rr: 30, weight: 3.2, bcs: 4, pain: 0, mm: 'Pink', crt: 1.0 },
        { visitIdx: 3, temp: 101.5, hr: 90, rr: 20, weight: 32, bcs: 6, pain: 0, mm: 'Pink', crt: 1.5 },
      ];

      for (const v of vitals) {
        await qr.query(
          `INSERT INTO "vitals" ("visitId","recordedById","temperature","temperatureUnit","heartRate","respiratoryRate","weight","weightUnit","bodyConditionScore","painScore","mucousMembraneColor","capillaryRefillTime","recordedAt")
           VALUES ($1,$2,$3,'F',$4,$5,$6,'kg',$7,$8,$9,$10,NOW())`,
          [visitIds[v.visitIdx], vetId1, v.temp, v.hr, v.rr, v.weight, v.bcs, v.pain, v.mm, v.crt],
        );
      }

      // ──── 7. Clinical notes ────
      await qr.query(
        `INSERT INTO "clinical_notes" ("visitId","authorId","noteType","content")
         VALUES ($1,$2,'soap',$3)`,
        [visitIds[0], vetId1, JSON.stringify({
          subjective: 'Owner reports Buddy is eating and drinking normally. No vomiting or diarrhea. Activity level normal.',
          objective: 'Bright, alert, responsive. EENT: Normal. CV: NSR, no murmurs. Resp: Clear lung fields bilaterally. Abdomen: Soft, non-painful. Skin: Healthy coat, no lesions.',
          assessment: 'Healthy adult dog. Weight stable. All systems within normal limits for age.',
          plan: 'Continue current diet. Annual bloodwork recommended. Heartworm prevention up to date. Recheck in 12 months.',
        })],
      );

      await qr.query(
        `INSERT INTO "clinical_notes" ("visitId","authorId","noteType","content")
         VALUES ($1,$2,'soap',$3)`,
        [visitIds[1], vetId1, JSON.stringify({
          subjective: 'Owner noticed left eye discharge for 3 days. Clear to slightly mucoid. Cat eating normally.',
          objective: 'Moderate serous discharge OS. Mild conjunctival hyperemia. No corneal ulcer on fluorescein. OD normal. No nasal discharge.',
          assessment: 'Mild conjunctivitis OS, likely viral etiology.',
          plan: 'Artificial tears 2-3x daily. Monitor for worsening. Recheck if not improved in 7 days. E-collar if scratching at eye.',
        })],
      );

      // ──── 8. Vaccinations ────
      const vaccinations = [
        { patientIdx: 0, visitIdx: 0, name: 'Rabies', mfg: 'Zoetis', lot: 'RAB-2024-1122', route: 'SC', site: 'Right rear leg', daysAgo: 0, nextDue: 365 },
        { patientIdx: 0, visitIdx: 0, name: 'DHPP', mfg: 'Merck', lot: 'DHP-2024-3344', route: 'SC', site: 'Right shoulder', daysAgo: 0, nextDue: 365 },
        { patientIdx: 2, visitIdx: null, name: 'Rabies', mfg: 'Zoetis', lot: 'RAB-2024-5566', route: 'SC', site: 'Right rear leg', daysAgo: 180, nextDue: 185 },
        { patientIdx: 11, visitIdx: 2, name: 'FVRCP', mfg: 'Boehringer', lot: 'FVR-2024-7788', route: 'SC', site: 'Right shoulder', daysAgo: 0, nextDue: 21 },
        { patientIdx: 5, visitIdx: null, name: 'DHPP', mfg: 'Merck', lot: 'DHP-2023-9900', route: 'SC', site: 'Left shoulder', daysAgo: 340, nextDue: 25 },
        { patientIdx: 4, visitIdx: null, name: 'Bordetella', mfg: 'Zoetis', lot: 'BOR-2024-1100', route: 'IN', site: 'Intranasal', daysAgo: 300, nextDue: 65 },
      ];

      for (const v of vaccinations) {
        const administered = new Date(now);
        administered.setDate(administered.getDate() - v.daysAgo);
        const nextDue = new Date(administered);
        nextDue.setDate(nextDue.getDate() + v.nextDue);

        await qr.query(
          `INSERT INTO "vaccinations" ("patientId","visitId","administeredById","vaccineName","manufacturer","lotNumber","route","site","dateAdministered","nextDueDate","status","cost")
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [
            patientIds[v.patientIdx], v.visitIdx !== null ? visitIds[v.visitIdx] : null, vetId1,
            v.name, v.mfg, v.lot, v.route, v.site,
            administered.toISOString(), nextDue.toISOString(),
            v.daysAgo === 0 ? 'administered' : 'administered', 35.00,
          ],
        );
      }

      // ──── 9. Preventive Care ────
      const preventive = [
        { patientIdx: 0, type: 'heartworm', name: 'Heartgard Plus', product: 'Heartgard Plus 51-100 lbs', freqDays: 30, daysAgo: 15, status: 'active' },
        { patientIdx: 0, type: 'flea_tick', name: 'NexGard', product: 'NexGard 60.1-121 lbs', freqDays: 30, daysAgo: 15, status: 'active' },
        { patientIdx: 2, type: 'heartworm', name: 'Heartgard Plus', product: 'Heartgard Plus 51-100 lbs', freqDays: 30, daysAgo: 45, status: 'overdue' },
        { patientIdx: 4, type: 'flea_tick', name: 'Bravecto', product: 'Bravecto 44-88 lbs', freqDays: 90, daysAgo: 80, status: 'active' },
        { patientIdx: 5, type: 'dental', name: 'Dental Cleaning', product: null, freqDays: 365, daysAgo: 400, status: 'overdue' },
        { patientIdx: 3, type: 'blood_work', name: 'Senior Blood Panel', product: null, freqDays: 180, daysAgo: 200, status: 'overdue' },
      ];

      for (const p of preventive) {
        const lastAdmin = new Date(now);
        lastAdmin.setDate(lastAdmin.getDate() - p.daysAgo);
        const nextDue = new Date(lastAdmin);
        nextDue.setDate(nextDue.getDate() + p.freqDays);

        await qr.query(
          `INSERT INTO "preventive_care" ("patientId","careType","name","productName","lastAdministered","nextDueDate","frequencyDays","status")
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [patientIds[p.patientIdx], p.type, p.name, p.product, lastAdmin.toISOString(), nextDue.toISOString(), p.freqDays, p.status],
        );
      }

      // ──── 10. Inventory ────
      const inventory = [
        { sku: 'MED-001', name: 'Rimadyl 75mg', cat: 'medication', unit: 'tablet', mfg: 'Zoetis', cost: 0.85, price: 2.50, qty: 240, reorder: 50, rx: true, ctrl: false },
        { sku: 'MED-002', name: 'Amoxicillin 250mg', cat: 'medication', unit: 'capsule', mfg: 'Generic', cost: 0.15, price: 0.75, qty: 500, reorder: 100, rx: true, ctrl: false },
        { sku: 'MED-003', name: 'Tramadol 50mg', cat: 'medication', unit: 'tablet', mfg: 'Generic', cost: 0.30, price: 1.50, qty: 180, reorder: 50, rx: true, ctrl: true },
        { sku: 'VAC-001', name: 'Rabies Vaccine (1yr)', cat: 'vaccine', unit: 'dose', mfg: 'Zoetis', cost: 8.00, price: 25.00, qty: 45, reorder: 20, rx: false, ctrl: false },
        { sku: 'VAC-002', name: 'DHPP Vaccine', cat: 'vaccine', unit: 'dose', mfg: 'Merck', cost: 6.50, price: 22.00, qty: 38, reorder: 15, rx: false, ctrl: false },
        { sku: 'VAC-003', name: 'FVRCP Vaccine', cat: 'vaccine', unit: 'dose', mfg: 'Boehringer', cost: 5.50, price: 20.00, qty: 30, reorder: 10, rx: false, ctrl: false },
        { sku: 'SUP-001', name: 'Surgical Gloves (M)', cat: 'surgical_supply', unit: 'box', mfg: 'Medline', cost: 8.00, price: 12.00, qty: 12, reorder: 5, rx: false, ctrl: false },
        { sku: 'SUP-002', name: 'Suture Vicryl 3-0', cat: 'surgical_supply', unit: 'pack', mfg: 'Ethicon', cost: 12.00, price: 25.00, qty: 8, reorder: 10, rx: false, ctrl: false },
        { sku: 'LAB-001', name: 'Blood Collection Tubes', cat: 'lab_supply', unit: 'box', mfg: 'BD', cost: 15.00, price: 22.00, qty: 6, reorder: 5, rx: false, ctrl: false },
        { sku: 'FD-001', name: 'Hill\'s Science Diet (Adult)', cat: 'food', unit: 'bag', mfg: 'Hill\'s', cost: 35.00, price: 55.00, qty: 18, reorder: 5, rx: false, ctrl: false },
        { sku: 'MED-004', name: 'Cerenia 16mg', cat: 'medication', unit: 'tablet', mfg: 'Zoetis', cost: 3.50, price: 8.00, qty: 3, reorder: 20, rx: true, ctrl: false },
        { sku: 'SUP-003', name: 'IV Catheter 20g', cat: 'surgical_supply', unit: 'unit', mfg: 'Terumo', cost: 2.50, price: 5.00, qty: 4, reorder: 15, rx: false, ctrl: false },
      ];

      for (const item of inventory) {
        await qr.query(
          `INSERT INTO "inventory_items" ("sku","name","category","unit","manufacturer","costPrice","sellingPrice","quantityOnHand","reorderLevel","reorderQuantity","isActive","requiresPrescription","isControlledSubstance")
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,50,true,$10,$11) ON CONFLICT ("sku") DO UPDATE SET "quantityOnHand"=$8`,
          [item.sku, item.name, item.cat, item.unit, item.mfg, item.cost, item.price, item.qty, item.reorder, item.rx, item.ctrl],
        );
      }

      // ──── 11. Invoices ────
      const invoiceData = [
        { clientIdx: 0, patientIdx: 0, visitIdx: 0, status: 'paid', total: 185.00, paid: 185.00, items: [
          { desc: 'Office Visit - Wellness Exam', cat: 'exam', qty: 1, price: 65.00 },
          { desc: 'Rabies Vaccine (1yr)', cat: 'vaccine', qty: 1, price: 35.00 },
          { desc: 'DHPP Vaccine', cat: 'vaccine', qty: 1, price: 35.00 },
          { desc: 'Heartworm Test', cat: 'lab', qty: 1, price: 50.00 },
        ]},
        { clientIdx: 3, patientIdx: 6, visitIdx: 1, status: 'paid', total: 95.00, paid: 95.00, items: [
          { desc: 'Office Visit - Sick', cat: 'exam', qty: 1, price: 55.00 },
          { desc: 'Fluorescein Stain Test', cat: 'diagnostic', qty: 1, price: 25.00 },
          { desc: 'Artificial Tears (15ml)', cat: 'medication', qty: 1, price: 15.00 },
        ]},
        { clientIdx: 7, patientIdx: 11, visitIdx: 2, status: 'sent', total: 120.00, paid: 0, items: [
          { desc: 'Office Visit - New Patient', cat: 'exam', qty: 1, price: 75.00 },
          { desc: 'FVRCP Vaccine', cat: 'vaccine', qty: 1, price: 25.00 },
          { desc: 'Fecal Test', cat: 'lab', qty: 1, price: 20.00 },
        ]},
        { clientIdx: 0, patientIdx: 0, visitIdx: 3, status: 'paid', total: 45.00, paid: 45.00, items: [
          { desc: 'Post-op Recheck', cat: 'exam', qty: 1, price: 35.00 },
          { desc: 'Suture Removal', cat: 'procedure', qty: 1, price: 10.00 },
        ]},
        { clientIdx: 4, patientIdx: 7, visitIdx: null, status: 'overdue', total: 310.00, paid: 0, items: [
          { desc: 'Office Visit - Emergency', cat: 'exam', qty: 1, price: 95.00 },
          { desc: 'X-Ray (2 views)', cat: 'imaging', qty: 1, price: 145.00 },
          { desc: 'Tramadol 50mg x 14', cat: 'medication', qty: 14, price: 1.50 },
          { desc: 'Rimadyl 75mg x 14', cat: 'medication', qty: 14, price: 2.50 },
        ]},
      ];

      let invNum = 10001;
      for (const inv of invoiceData) {
        const subtotal = inv.items.reduce((s, i) => s + i.qty * i.price, 0);
        const taxAmt = +(subtotal * 0.06).toFixed(2);
        const total = +(subtotal + taxAmt).toFixed(2);
        const balance = +(total - inv.paid).toFixed(2);
        const issueDate = new Date(now);
        issueDate.setDate(issueDate.getDate() - (inv.status === 'overdue' ? 35 : inv.status === 'sent' ? 1 : 5));
        const dueDate = new Date(issueDate);
        dueDate.setDate(dueDate.getDate() + 30);

        const [row] = await qr.query(
          `INSERT INTO "invoices" ("invoiceNumber","clientId","patientId","visitId","status","issueDate","dueDate","subtotal","taxRate","taxAmount","discountAmount","totalAmount","amountPaid","balanceDue","paymentMethod","paymentDate")
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,0.06,$9,0,$10,$11,$12,$13,$14) RETURNING id`,
          [
            `INV-${invNum++}`, clientIds[inv.clientIdx], patientIds[inv.patientIdx],
            inv.visitIdx !== null ? visitIds[inv.visitIdx] : null,
            inv.status, issueDate.toISOString(), dueDate.toISOString(),
            subtotal, taxAmt, total, inv.paid, balance,
            inv.paid > 0 ? 'credit_card' : null, inv.paid > 0 ? issueDate.toISOString() : null,
          ],
        );

        for (const item of inv.items) {
          await qr.query(
            `INSERT INTO "invoice_items" ("invoiceId","description","category","quantity","unitPrice","lineTotal")
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [row.id, item.desc, item.cat, item.qty, item.price, +(item.qty * item.price).toFixed(2)],
          );
        }
      }

      // ──── 12. Clinic Settings ────
      await qr.query(
        `INSERT INTO "clinic_settings" ("clinicName","phone","email","address","city","state","zipCode","country","timezone","currency","appointmentSlotMinutes","businessHoursStart","businessHoursEnd","defaultTaxRate","invoicePaymentTermsDays","invoiceFooter")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
         ON CONFLICT DO NOTHING`,
        [
          'Springfield Veterinary Clinic', '(555) 123-4567', 'info@springfieldvet.com',
          '500 Main Street', 'Springfield', 'IL', '62701', 'US',
          'America/Chicago', 'USD', 30, '08:00', '18:00', 0.06, 30,
          'Thank you for trusting us with your pet\'s care! Payment is due within 30 days.',
        ],
      );

      await qr.commitTransaction();

      return {
        success: true,
        message: 'Demo data seeded successfully',
        summary: {
          users: users.length,
          clients: clients.length,
          patients: patients.length,
          appointments: appointments.length,
          visits: visitData.length,
          vaccinations: vaccinations.length,
          inventoryItems: inventory.length,
          invoices: invoiceData.length,
        },
      };
    } catch (error) {
      await qr.rollbackTransaction();
      throw error;
    } finally {
      await qr.release();
    }
  }
}
