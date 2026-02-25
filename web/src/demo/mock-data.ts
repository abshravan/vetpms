// ── Deterministic IDs ──
const uid = (n: number) => `10000000-0000-0000-0000-00000000000${n}`;
const cid = (n: number) => `20000000-0000-0000-0000-00000000000${n}`;
const pid = (n: number) => `30000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
const aid = (n: number) => `40000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
const vid = (n: number) => `50000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
const iid = (n: number) => `60000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
const invId = (n: number) => `70000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
const nid = (n: number) => `80000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
const vitId = (n: number) => `90000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
const noteId = (n: number) => `A0000000-0000-0000-0000-${String(n).padStart(12, '0')}`;

// ── Helpers ──
const now = new Date();
const today = now.toISOString().slice(0, 10);
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000).toISOString();
const todayAt = (h: number, m = 0) => {
  const d = new Date(now);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
const yearsAgo = (y: number) => {
  const d = new Date(now);
  d.setFullYear(d.getFullYear() - y);
  return d.toISOString().slice(0, 10);
};

// ── Users ──
export const users = [
  { id: uid(1), firstName: 'Sarah', lastName: 'Mitchell', email: 'sarah.mitchell@vetpms.demo', role: 'admin' as const, phone: '(555) 100-0001', specialty: 'Practice Manager', licenseNumber: null, isActive: true, createdAt: daysAgo(365) },
  { id: uid(2), firstName: 'James', lastName: 'Carter', email: 'james.carter@vetpms.demo', role: 'vet' as const, phone: '(555) 100-0002', specialty: 'Small Animal Medicine', licenseNumber: 'DVM-2019-4821', isActive: true, createdAt: daysAgo(350) },
  { id: uid(3), firstName: 'Emily', lastName: 'Park', email: 'emily.park@vetpms.demo', role: 'vet' as const, phone: '(555) 100-0003', specialty: 'Surgery & Orthopedics', licenseNumber: 'DVM-2017-3150', isActive: true, createdAt: daysAgo(340) },
  { id: uid(4), firstName: 'Lisa', lastName: 'Nguyen', email: 'lisa.nguyen@vetpms.demo', role: 'tech' as const, phone: '(555) 100-0004', specialty: 'Dental Care', licenseNumber: 'CVT-2020-8877', isActive: true, createdAt: daysAgo(300) },
  { id: uid(5), firstName: 'Mark', lastName: 'Davis', email: 'mark.davis@vetpms.demo', role: 'receptionist' as const, phone: '(555) 100-0005', specialty: null, licenseNumber: null, isActive: true, createdAt: daysAgo(280) },
];

const vet1 = { id: uid(2), firstName: 'James', lastName: 'Carter', email: 'james.carter@vetpms.demo', role: 'vet' };
const vet2 = { id: uid(3), firstName: 'Emily', lastName: 'Park', email: 'emily.park@vetpms.demo', role: 'vet' };

// ── Clients ──
export const clients = [
  { id: cid(1), firstName: 'Michael', lastName: 'Johnson', email: 'michael.j@example.com', phone: '(555) 234-5678', alternatePhone: null, address: '142 Oak Avenue', city: 'Springfield', state: 'IL', zipCode: '62701', notes: 'Preferred contact: email', isActive: true, patients: [] as typeof patients, createdAt: daysAgo(200), updatedAt: daysAgo(10) },
  { id: cid(2), firstName: 'Amanda', lastName: 'Williams', email: 'amanda.w@example.com', phone: '(555) 345-6789', alternatePhone: '(555) 345-0000', address: '88 Maple Drive', city: 'Springfield', state: 'IL', zipCode: '62702', notes: null, isActive: true, patients: [] as typeof patients, createdAt: daysAgo(180), updatedAt: daysAgo(5) },
  { id: cid(3), firstName: 'Robert', lastName: 'Garcia', email: 'robert.g@example.com', phone: '(555) 456-7890', alternatePhone: null, address: '305 Pine Street', city: 'Chatham', state: 'IL', zipCode: '62629', notes: 'Has 2 exotic pets', isActive: true, patients: [] as typeof patients, createdAt: daysAgo(170), updatedAt: daysAgo(15) },
  { id: cid(4), firstName: 'Jessica', lastName: 'Brown', email: 'jessica.b@example.com', phone: '(555) 567-8901', alternatePhone: null, address: '12 Elm Court', city: 'Rochester', state: 'IL', zipCode: '62563', notes: null, isActive: true, patients: [] as typeof patients, createdAt: daysAgo(150), updatedAt: daysAgo(8) },
  { id: cid(5), firstName: 'David', lastName: 'Martinez', email: 'david.m@example.com', phone: '(555) 678-9012', alternatePhone: null, address: '700 Cedar Lane', city: 'Springfield', state: 'IL', zipCode: '62703', notes: 'Reptile owner — prefers Dr. Park', isActive: true, patients: [] as typeof patients, createdAt: daysAgo(130), updatedAt: daysAgo(20) },
  { id: cid(6), firstName: 'Sarah', lastName: 'Anderson', email: 'sarah.a@example.com', phone: '(555) 789-0123', alternatePhone: null, address: '29 Birch Rd', city: 'Springfield', state: 'IL', zipCode: '62704', notes: null, isActive: true, patients: [] as typeof patients, createdAt: daysAgo(120), updatedAt: daysAgo(3) },
  { id: cid(7), firstName: 'Chris', lastName: 'Taylor', email: 'chris.t@example.com', phone: '(555) 890-1234', alternatePhone: null, address: '415 Walnut Blvd', city: 'Sherman', state: 'IL', zipCode: '62684', notes: null, isActive: true, patients: [] as typeof patients, createdAt: daysAgo(90), updatedAt: daysAgo(12) },
  { id: cid(8), firstName: 'Karen', lastName: 'Thomas', email: 'karen.t@example.com', phone: '(555) 901-2345', alternatePhone: null, address: '63 Ash Way', city: 'Springfield', state: 'IL', zipCode: '62701', notes: 'Board member of local humane society', isActive: true, patients: [] as typeof patients, createdAt: daysAgo(80), updatedAt: daysAgo(1) },
];

// ── Patients ──
export const patients = [
  { id: pid(1), clientId: cid(1), name: 'Max', species: 'dog' as const, breed: 'Golden Retriever', color: 'Golden', sex: 'male_neutered' as const, dateOfBirth: yearsAgo(4), weight: 72, weightUnit: 'lbs', microchipNumber: '985112345678901', insuranceProvider: 'PetPlan', insurancePolicyNumber: 'PP-90421', allergies: null, notes: 'Very friendly, loves treats', photoUrl: null, isActive: true, isDeceased: false, deceasedDate: null, createdAt: daysAgo(200), updatedAt: daysAgo(10) },
  { id: pid(2), clientId: cid(1), name: 'Luna', species: 'cat' as const, breed: 'Siamese', color: 'Seal point', sex: 'female_spayed' as const, dateOfBirth: yearsAgo(3), weight: 9.5, weightUnit: 'lbs', microchipNumber: '985112345678902', insuranceProvider: null, insurancePolicyNumber: null, allergies: 'Chicken-based food', notes: 'Indoor only', photoUrl: null, isActive: true, isDeceased: false, deceasedDate: null, createdAt: daysAgo(195), updatedAt: daysAgo(10) },
  { id: pid(3), clientId: cid(2), name: 'Bella', species: 'dog' as const, breed: 'Labrador Retriever', color: 'Chocolate', sex: 'female_spayed' as const, dateOfBirth: yearsAgo(6), weight: 65, weightUnit: 'lbs', microchipNumber: '985112345678903', insuranceProvider: 'Trupanion', insurancePolicyNumber: 'TR-55120', allergies: 'Beef', notes: 'Hip dysplasia history', photoUrl: null, isActive: true, isDeceased: false, deceasedDate: null, createdAt: daysAgo(180), updatedAt: daysAgo(5) },
  { id: pid(4), clientId: cid(2), name: 'Whiskers', species: 'cat' as const, breed: 'Persian', color: 'White', sex: 'male_neutered' as const, dateOfBirth: yearsAgo(8), weight: 11.2, weightUnit: 'lbs', microchipNumber: null, insuranceProvider: null, insurancePolicyNumber: null, allergies: null, notes: 'Requires sedation for grooming', photoUrl: null, isActive: true, isDeceased: false, deceasedDate: null, createdAt: daysAgo(175), updatedAt: daysAgo(30) },
  { id: pid(5), clientId: cid(3), name: 'Rocky', species: 'dog' as const, breed: 'German Shepherd', color: 'Black & Tan', sex: 'male' as const, dateOfBirth: yearsAgo(2), weight: 85, weightUnit: 'lbs', microchipNumber: '985112345678905', insuranceProvider: 'Nationwide', insurancePolicyNumber: 'NW-78302', allergies: null, notes: 'Working dog, agility training', photoUrl: null, isActive: true, isDeceased: false, deceasedDate: null, createdAt: daysAgo(170), updatedAt: daysAgo(15) },
  { id: pid(6), clientId: cid(3), name: 'Mango', species: 'bird' as const, breed: 'Cockatiel', color: 'Lutino', sex: 'male' as const, dateOfBirth: yearsAgo(5), weight: 0.21, weightUnit: 'lbs', microchipNumber: null, insuranceProvider: null, insurancePolicyNumber: null, allergies: null, notes: 'Can say a few words', photoUrl: null, isActive: true, isDeceased: false, deceasedDate: null, createdAt: daysAgo(165), updatedAt: daysAgo(60) },
  { id: pid(7), clientId: cid(4), name: 'Daisy', species: 'dog' as const, breed: 'Beagle', color: 'Tricolor', sex: 'female_spayed' as const, dateOfBirth: yearsAgo(5), weight: 28, weightUnit: 'lbs', microchipNumber: '985112345678907', insuranceProvider: null, insurancePolicyNumber: null, allergies: 'Penicillin', notes: null, photoUrl: null, isActive: true, isDeceased: false, deceasedDate: null, createdAt: daysAgo(150), updatedAt: daysAgo(8) },
  { id: pid(8), clientId: cid(4), name: 'Shadow', species: 'cat' as const, breed: 'Domestic Shorthair', color: 'Black', sex: 'male_neutered' as const, dateOfBirth: yearsAgo(3), weight: 10, weightUnit: 'lbs', microchipNumber: null, insuranceProvider: null, insurancePolicyNumber: null, allergies: null, notes: 'FIV positive', photoUrl: null, isActive: true, isDeceased: false, deceasedDate: null, createdAt: daysAgo(145), updatedAt: daysAgo(25) },
  { id: pid(9), clientId: cid(5), name: 'Thor', species: 'dog' as const, breed: 'Rottweiler', color: 'Black & Mahogany', sex: 'male' as const, dateOfBirth: yearsAgo(3), weight: 110, weightUnit: 'lbs', microchipNumber: '985112345678909', insuranceProvider: null, insurancePolicyNumber: null, allergies: null, notes: 'Muzzle required for exams', photoUrl: null, isActive: true, isDeceased: false, deceasedDate: null, createdAt: daysAgo(130), updatedAt: daysAgo(20) },
  { id: pid(10), clientId: cid(5), name: 'Noodle', species: 'reptile' as const, breed: 'Ball Python', color: 'Normal morph', sex: 'female' as const, dateOfBirth: yearsAgo(4), weight: 3.8, weightUnit: 'lbs', microchipNumber: null, insuranceProvider: null, insurancePolicyNumber: null, allergies: null, notes: 'Feeds on frozen/thawed mice', photoUrl: null, isActive: true, isDeceased: false, deceasedDate: null, createdAt: daysAgo(125), updatedAt: daysAgo(40) },
  { id: pid(11), clientId: cid(6), name: 'Cooper', species: 'dog' as const, breed: 'Australian Shepherd', color: 'Blue Merle', sex: 'male_neutered' as const, dateOfBirth: yearsAgo(2), weight: 52, weightUnit: 'lbs', microchipNumber: '985112345678911', insuranceProvider: 'PetPlan', insurancePolicyNumber: 'PP-12098', allergies: null, notes: 'MDR1 gene positive — avoid ivermectin', photoUrl: null, isActive: true, isDeceased: false, deceasedDate: null, createdAt: daysAgo(120), updatedAt: daysAgo(3) },
  { id: pid(12), clientId: cid(7), name: 'Milo', species: 'dog' as const, breed: 'French Bulldog', color: 'Fawn', sex: 'male_neutered' as const, dateOfBirth: yearsAgo(4), weight: 24, weightUnit: 'lbs', microchipNumber: '985112345678912', insuranceProvider: 'Embrace', insurancePolicyNumber: 'EM-44521', allergies: null, notes: 'Brachycephalic — monitor breathing', photoUrl: null, isActive: true, isDeceased: false, deceasedDate: null, createdAt: daysAgo(90), updatedAt: daysAgo(12) },
  { id: pid(13), clientId: cid(8), name: 'Cleo', species: 'cat' as const, breed: 'Maine Coon', color: 'Brown Tabby', sex: 'female_spayed' as const, dateOfBirth: yearsAgo(6), weight: 14.5, weightUnit: 'lbs', microchipNumber: '985112345678913', insuranceProvider: null, insurancePolicyNumber: null, allergies: null, notes: 'Gentle giant, good with handling', photoUrl: null, isActive: true, isDeceased: false, deceasedDate: null, createdAt: daysAgo(80), updatedAt: daysAgo(1) },
];

// Wire up client.patients references
clients[0].patients = [patients[0], patients[1]];
clients[1].patients = [patients[2], patients[3]];
clients[2].patients = [patients[4], patients[5]];
clients[3].patients = [patients[6], patients[7]];
clients[4].patients = [patients[8], patients[9]];
clients[5].patients = [patients[10]];
clients[6].patients = [patients[11]];
clients[7].patients = [patients[12]];

// Add client back-references to patients
const patientsWithClient = patients.map((p) => {
  const c = clients.find((cl) => cl.id === p.clientId)!;
  return { ...p, client: { ...c, patients: [] } };
});

// ── Appointments ──
export const appointments = [
  // Today
  { id: aid(1), clientId: cid(1), client: clients[0], patientId: pid(1), patient: patients[0], vetId: uid(2), vet: vet1, startTime: todayAt(9, 0), endTime: todayAt(9, 30), type: 'checkup' as const, status: 'checked_in' as const, reason: 'Annual wellness exam', notes: null, cancellationReason: null, createdAt: daysAgo(7), updatedAt: today },
  { id: aid(2), clientId: cid(2), client: clients[1], patientId: pid(3), patient: patients[2], vetId: uid(2), vet: vet1, startTime: todayAt(10, 0), endTime: todayAt(10, 30), type: 'follow_up' as const, status: 'scheduled' as const, reason: 'Hip dysplasia follow-up', notes: 'Bring recent X-rays', cancellationReason: null, createdAt: daysAgo(5), updatedAt: daysAgo(5) },
  { id: aid(3), clientId: cid(6), client: clients[5], patientId: pid(11), patient: patients[10], vetId: uid(3), vet: vet2, startTime: todayAt(10, 30), endTime: todayAt(11, 0), type: 'vaccination' as const, status: 'confirmed' as const, reason: 'Rabies booster', notes: null, cancellationReason: null, createdAt: daysAgo(14), updatedAt: daysAgo(2) },
  { id: aid(4), clientId: cid(7), client: clients[6], patientId: pid(12), patient: patients[11], vetId: uid(3), vet: vet2, startTime: todayAt(11, 0), endTime: todayAt(11, 30), type: 'dental' as const, status: 'scheduled' as const, reason: 'Dental cleaning evaluation', notes: 'Check for retained baby teeth', cancellationReason: null, createdAt: daysAgo(10), updatedAt: daysAgo(10) },
  { id: aid(5), clientId: cid(4), client: clients[3], patientId: pid(7), patient: patients[6], vetId: uid(2), vet: vet1, startTime: todayAt(13, 0), endTime: todayAt(13, 30), type: 'lab_work' as const, status: 'scheduled' as const, reason: 'Senior bloodwork panel', notes: 'Fasting required', cancellationReason: null, createdAt: daysAgo(3), updatedAt: daysAgo(3) },
  // Tomorrow
  { id: aid(6), clientId: cid(3), client: clients[2], patientId: pid(5), patient: patients[4], vetId: uid(2), vet: vet1, startTime: todayAt(9, 0).replace(today, daysFromNow(1).slice(0, 10)), endTime: todayAt(9, 30).replace(today, daysFromNow(1).slice(0, 10)), type: 'checkup' as const, status: 'scheduled' as const, reason: 'Routine check-up', notes: null, cancellationReason: null, createdAt: daysAgo(4), updatedAt: daysAgo(4) },
  { id: aid(7), clientId: cid(8), client: clients[7], patientId: pid(13), patient: patients[12], vetId: uid(3), vet: vet2, startTime: todayAt(10, 0).replace(today, daysFromNow(1).slice(0, 10)), endTime: todayAt(10, 30).replace(today, daysFromNow(1).slice(0, 10)), type: 'vaccination' as const, status: 'confirmed' as const, reason: 'FVRCP booster', notes: null, cancellationReason: null, createdAt: daysAgo(10), updatedAt: daysAgo(1) },
  // Past (completed)
  { id: aid(8), clientId: cid(1), client: clients[0], patientId: pid(2), patient: patients[1], vetId: uid(2), vet: vet1, startTime: daysAgo(3), endTime: daysAgo(3), type: 'checkup' as const, status: 'completed' as const, reason: 'Vaccine update', notes: 'All vaccines administered', cancellationReason: null, createdAt: daysAgo(10), updatedAt: daysAgo(3) },
  { id: aid(9), clientId: cid(5), client: clients[4], patientId: pid(9), patient: patients[8], vetId: uid(3), vet: vet2, startTime: daysAgo(5), endTime: daysAgo(5), type: 'emergency' as const, status: 'completed' as const, reason: 'Limping on right hind leg', notes: 'X-ray revealed no fracture, soft tissue injury', cancellationReason: null, createdAt: daysAgo(5), updatedAt: daysAgo(5) },
  { id: aid(10), clientId: cid(2), client: clients[1], patientId: pid(4), patient: patients[3], vetId: uid(2), vet: vet1, startTime: daysAgo(7), endTime: daysAgo(7), type: 'grooming' as const, status: 'completed' as const, reason: 'Full grooming under sedation', notes: 'Sedation went well', cancellationReason: null, createdAt: daysAgo(14), updatedAt: daysAgo(7) },
  // Cancelled
  { id: aid(11), clientId: cid(3), client: clients[2], patientId: pid(6), patient: patients[5], vetId: uid(3), vet: vet2, startTime: daysAgo(2), endTime: daysAgo(2), type: 'checkup' as const, status: 'cancelled' as const, reason: 'Wing check', notes: null, cancellationReason: 'Client rescheduling', createdAt: daysAgo(9), updatedAt: daysAgo(2) },
  // Day after tomorrow
  { id: aid(12), clientId: cid(5), client: clients[4], patientId: pid(10), patient: patients[9], vetId: uid(3), vet: vet2, startTime: todayAt(14, 0).replace(today, daysFromNow(2).slice(0, 10)), endTime: todayAt(14, 30).replace(today, daysFromNow(2).slice(0, 10)), type: 'checkup' as const, status: 'scheduled' as const, reason: 'Annual reptile wellness', notes: 'Bring current husbandry info', cancellationReason: null, createdAt: daysAgo(7), updatedAt: daysAgo(7) },
];

// ── Visits ──
export const visits = [
  {
    id: vid(1), patientId: pid(1), patient: patients[0], clientId: cid(1), client: clients[0], vetId: uid(2), vet: { id: uid(2), firstName: 'James', lastName: 'Carter' }, appointmentId: aid(1), status: 'in_progress' as const, chiefComplaint: 'Annual wellness exam',
    vitals: [{
      id: vitId(1), visitId: vid(1), recordedById: uid(4), recordedBy: { id: uid(4), firstName: 'Lisa', lastName: 'Nguyen' },
      temperature: 101.2, temperatureUnit: '°F', heartRate: 88, respiratoryRate: 18, weight: 72, weightUnit: 'lbs',
      bodyConditionScore: 5, painScore: 0, mucousMembraneColor: 'Pink', capillaryRefillTime: 1.5, notes: 'Bright, alert, responsive', recordedAt: todayAt(9, 10),
    }],
    clinicalNotes: [], createdAt: todayAt(9, 5), updatedAt: todayAt(9, 10),
  },
  {
    id: vid(2), patientId: pid(2), patient: patients[1], clientId: cid(1), client: clients[0], vetId: uid(2), vet: { id: uid(2), firstName: 'James', lastName: 'Carter' }, appointmentId: aid(8), status: 'completed' as const, chiefComplaint: 'Vaccine update',
    vitals: [{
      id: vitId(2), visitId: vid(2), recordedById: uid(4), recordedBy: { id: uid(4), firstName: 'Lisa', lastName: 'Nguyen' },
      temperature: 100.8, temperatureUnit: '°F', heartRate: 180, respiratoryRate: 24, weight: 9.5, weightUnit: 'lbs',
      bodyConditionScore: 5, painScore: 0, mucousMembraneColor: 'Pink', capillaryRefillTime: 1.0, notes: null, recordedAt: daysAgo(3),
    }],
    clinicalNotes: [{
      id: noteId(1), visitId: vid(2), authorId: uid(2), author: { id: uid(2), firstName: 'James', lastName: 'Carter' },
      noteType: 'soap' as const,
      content: {
        subjective: 'Owner reports Luna is doing well. Eating normally, normal litter box habits. Indoor only cat.',
        objective: 'T: 100.8°F, HR: 180, RR: 24. BCS 5/9. Coat glossy, no masses palpated. Ears clean, eyes clear. Heart & lungs auscult normal.',
        assessment: 'Healthy adult cat. Due for FVRCP booster.',
        plan: 'Administered FVRCP vaccine (left shoulder). Discussed dental care—mild tartar buildup, recommend professional dental cleaning within 6 months. Recheck in 1 year.',
      },
      correctsNoteId: null, createdAt: daysAgo(3),
    }],
    createdAt: daysAgo(3), updatedAt: daysAgo(3),
  },
  {
    id: vid(3), patientId: pid(9), patient: patients[8], clientId: cid(5), client: clients[4], vetId: uid(3), vet: { id: uid(3), firstName: 'Emily', lastName: 'Park' }, appointmentId: aid(9), status: 'completed' as const, chiefComplaint: 'Limping on right hind leg',
    vitals: [{
      id: vitId(3), visitId: vid(3), recordedById: uid(4), recordedBy: { id: uid(4), firstName: 'Lisa', lastName: 'Nguyen' },
      temperature: 101.8, temperatureUnit: '°F', heartRate: 96, respiratoryRate: 22, weight: 110, weightUnit: 'lbs',
      bodyConditionScore: 6, painScore: 3, mucousMembraneColor: 'Pink', capillaryRefillTime: 1.5, notes: 'Reluctant to bear weight on R hind', recordedAt: daysAgo(5),
    }],
    clinicalNotes: [{
      id: noteId(2), visitId: vid(3), authorId: uid(3), author: { id: uid(3), firstName: 'Emily', lastName: 'Park' },
      noteType: 'soap' as const,
      content: {
        subjective: 'Owner noticed Thor limping after playing in the yard yesterday. No known trauma. Appetite normal but less active than usual.',
        objective: 'T: 101.8°F, HR: 96, RR: 22. Pain score 3/10. Mild swelling over R stifle. No crepitus. ROM slightly decreased. Radiographs: no fracture, mild soft tissue swelling.',
        assessment: 'Soft tissue injury of R stifle. Rule out partial cruciate tear—may need follow-up if not improving.',
        plan: 'Carprofen 75mg PO BID × 7 days. Strict rest (leash walks only) for 2 weeks. Ice packs 15min TID for 3 days. Recheck in 10-14 days. Call if worsening.',
      },
      correctsNoteId: null, createdAt: daysAgo(5),
    }],
    createdAt: daysAgo(5), updatedAt: daysAgo(5),
  },
  {
    id: vid(4), patientId: pid(4), patient: patients[3], clientId: cid(2), client: clients[1], vetId: uid(2), vet: { id: uid(2), firstName: 'James', lastName: 'Carter' }, appointmentId: aid(10), status: 'completed' as const, chiefComplaint: 'Full grooming under sedation',
    vitals: [{
      id: vitId(4), visitId: vid(4), recordedById: uid(4), recordedBy: { id: uid(4), firstName: 'Lisa', lastName: 'Nguyen' },
      temperature: 101.0, temperatureUnit: '°F', heartRate: 200, respiratoryRate: 28, weight: 11.2, weightUnit: 'lbs',
      bodyConditionScore: 6, painScore: 0, mucousMembraneColor: 'Pink', capillaryRefillTime: 1.0, notes: 'Pre-sedation vitals normal', recordedAt: daysAgo(7),
    }],
    clinicalNotes: [],
    createdAt: daysAgo(7), updatedAt: daysAgo(7),
  },
];

// ── Invoices ──
export const invoices = [
  {
    id: iid(1), invoiceNumber: 'INV-2026-001', clientId: cid(1), client: clients[0], patientId: pid(2), patient: patients[1], visitId: vid(2),
    status: 'paid' as const, issueDate: daysAgo(3).slice(0, 10), dueDate: daysFromNow(27).slice(0, 10),
    subtotal: 185, taxRate: 0.08, taxAmount: 14.80, discountAmount: 0, totalAmount: 199.80, amountPaid: 199.80, balanceDue: 0,
    paymentMethod: 'credit_card' as const, paymentDate: daysAgo(3).slice(0, 10), notes: null,
    items: [
      { id: 'li-1', invoiceId: iid(1), description: 'Office Visit - Wellness', category: 'exam', quantity: 1, unitPrice: 65, lineTotal: 65, notes: null },
      { id: 'li-2', invoiceId: iid(1), description: 'FVRCP Vaccine', category: 'vaccine', quantity: 1, unitPrice: 35, lineTotal: 35, notes: null },
      { id: 'li-3', invoiceId: iid(1), description: 'Rabies Vaccine', category: 'vaccine', quantity: 1, unitPrice: 25, lineTotal: 25, notes: null },
      { id: 'li-4', invoiceId: iid(1), description: 'Nail Trim', category: 'grooming', quantity: 1, unitPrice: 20, lineTotal: 20, notes: null },
      { id: 'li-5', invoiceId: iid(1), description: 'Deworming — Pyrantel', category: 'medication', quantity: 1, unitPrice: 40, lineTotal: 40, notes: null },
    ],
    createdAt: daysAgo(3), updatedAt: daysAgo(3),
  },
  {
    id: iid(2), invoiceNumber: 'INV-2026-002', clientId: cid(5), client: clients[4], patientId: pid(9), patient: patients[8], visitId: vid(3),
    status: 'sent' as const, issueDate: daysAgo(5).slice(0, 10), dueDate: daysFromNow(25).slice(0, 10),
    subtotal: 420, taxRate: 0.08, taxAmount: 33.60, discountAmount: 0, totalAmount: 453.60, amountPaid: 0, balanceDue: 453.60,
    paymentMethod: null, paymentDate: null, notes: null,
    items: [
      { id: 'li-6', invoiceId: iid(2), description: 'Emergency Exam', category: 'exam', quantity: 1, unitPrice: 120, lineTotal: 120, notes: null },
      { id: 'li-7', invoiceId: iid(2), description: 'Radiographs (2 views)', category: 'imaging', quantity: 1, unitPrice: 180, lineTotal: 180, notes: null },
      { id: 'li-8', invoiceId: iid(2), description: 'Carprofen 75mg (14 tabs)', category: 'medication', quantity: 1, unitPrice: 85, lineTotal: 85, notes: null },
      { id: 'li-9', invoiceId: iid(2), description: 'Bandage / Wrap', category: 'supply', quantity: 1, unitPrice: 35, lineTotal: 35, notes: null },
    ],
    createdAt: daysAgo(5), updatedAt: daysAgo(5),
  },
  {
    id: iid(3), invoiceNumber: 'INV-2026-003', clientId: cid(2), client: clients[1], patientId: pid(4), patient: patients[3], visitId: vid(4),
    status: 'paid' as const, issueDate: daysAgo(7).slice(0, 10), dueDate: daysFromNow(23).slice(0, 10),
    subtotal: 310, taxRate: 0.08, taxAmount: 24.80, discountAmount: 0, totalAmount: 334.80, amountPaid: 334.80, balanceDue: 0,
    paymentMethod: 'debit_card' as const, paymentDate: daysAgo(7).slice(0, 10), notes: null,
    items: [
      { id: 'li-10', invoiceId: iid(3), description: 'Sedated Grooming', category: 'grooming', quantity: 1, unitPrice: 150, lineTotal: 150, notes: null },
      { id: 'li-11', invoiceId: iid(3), description: 'Sedation (Dexmedetomidine)', category: 'medication', quantity: 1, unitPrice: 95, lineTotal: 95, notes: null },
      { id: 'li-12', invoiceId: iid(3), description: 'Office Visit', category: 'exam', quantity: 1, unitPrice: 65, lineTotal: 65, notes: null },
    ],
    createdAt: daysAgo(7), updatedAt: daysAgo(7),
  },
  {
    id: iid(4), invoiceNumber: 'INV-2026-004', clientId: cid(4), client: clients[3], patientId: pid(7), patient: patients[6], visitId: null,
    status: 'overdue' as const, issueDate: daysAgo(45).slice(0, 10), dueDate: daysAgo(15).slice(0, 10),
    subtotal: 275, taxRate: 0.08, taxAmount: 22.00, discountAmount: 0, totalAmount: 297.00, amountPaid: 100, balanceDue: 197.00,
    paymentMethod: 'cash' as const, paymentDate: daysAgo(40).slice(0, 10), notes: 'Partial payment received',
    items: [
      { id: 'li-13', invoiceId: iid(4), description: 'Comprehensive Exam', category: 'exam', quantity: 1, unitPrice: 85, lineTotal: 85, notes: null },
      { id: 'li-14', invoiceId: iid(4), description: 'Senior Bloodwork Panel', category: 'lab', quantity: 1, unitPrice: 150, lineTotal: 150, notes: null },
      { id: 'li-15', invoiceId: iid(4), description: 'Urinalysis', category: 'lab', quantity: 1, unitPrice: 40, lineTotal: 40, notes: null },
    ],
    createdAt: daysAgo(45), updatedAt: daysAgo(40),
  },
  {
    id: iid(5), invoiceNumber: 'INV-2026-005', clientId: cid(6), client: clients[5], patientId: pid(11), patient: patients[10], visitId: null,
    status: 'draft' as const, issueDate: today, dueDate: daysFromNow(30).slice(0, 10),
    subtotal: 90, taxRate: 0.08, taxAmount: 7.20, discountAmount: 0, totalAmount: 97.20, amountPaid: 0, balanceDue: 97.20,
    paymentMethod: null, paymentDate: null, notes: null,
    items: [
      { id: 'li-16', invoiceId: iid(5), description: 'Rabies Vaccine', category: 'vaccine', quantity: 1, unitPrice: 25, lineTotal: 25, notes: null },
      { id: 'li-17', invoiceId: iid(5), description: 'Office Visit', category: 'exam', quantity: 1, unitPrice: 65, lineTotal: 65, notes: null },
    ],
    createdAt: today, updatedAt: today,
  },
];

// ── Inventory (Pharmacy) ──
export const inventoryItems = [
  { id: invId(1), sku: 'MED-001', name: 'Carprofen 75mg', description: 'NSAID for pain relief in dogs', category: 'medication' as const, unit: 'tablet' as const, manufacturer: 'Zoetis', supplier: 'VetSource', costPrice: 0.85, sellingPrice: 2.50, quantityOnHand: 250, reorderLevel: 50, reorderQuantity: 200, lotNumber: 'CP-2026-A1', expirationDate: daysFromNow(365).slice(0, 10), location: 'Shelf A-1', isActive: true, requiresPrescription: true, isControlledSubstance: false, notes: null, createdAt: daysAgo(200), updatedAt: daysAgo(5) },
  { id: invId(2), sku: 'MED-002', name: 'Amoxicillin 250mg', description: 'Broad-spectrum antibiotic', category: 'medication' as const, unit: 'capsule' as const, manufacturer: 'Virbac', supplier: 'VetSource', costPrice: 0.35, sellingPrice: 1.20, quantityOnHand: 400, reorderLevel: 100, reorderQuantity: 300, lotNumber: 'AX-2026-B3', expirationDate: daysFromNow(300).slice(0, 10), location: 'Shelf A-2', isActive: true, requiresPrescription: true, isControlledSubstance: false, notes: null, createdAt: daysAgo(200), updatedAt: daysAgo(10) },
  { id: invId(3), sku: 'VAC-001', name: 'Rabies Vaccine (1yr)', description: 'Killed virus rabies vaccine — canine/feline', category: 'vaccine' as const, unit: 'dose' as const, manufacturer: 'Boehringer Ingelheim', supplier: 'MWI Animal Health', costPrice: 4.50, sellingPrice: 25.00, quantityOnHand: 40, reorderLevel: 15, reorderQuantity: 50, lotNumber: 'RB-26-1001', expirationDate: daysFromNow(180).slice(0, 10), location: 'Fridge 1', isActive: true, requiresPrescription: false, isControlledSubstance: false, notes: 'Refrigerate 2-8°C', createdAt: daysAgo(180), updatedAt: daysAgo(3) },
  { id: invId(4), sku: 'VAC-002', name: 'DHPP Vaccine', description: 'Canine distemper/hepatitis/parvo/parainfluenza', category: 'vaccine' as const, unit: 'dose' as const, manufacturer: 'Merck Animal Health', supplier: 'MWI Animal Health', costPrice: 6.00, sellingPrice: 32.00, quantityOnHand: 30, reorderLevel: 10, reorderQuantity: 40, lotNumber: 'DH-26-2043', expirationDate: daysFromNow(150).slice(0, 10), location: 'Fridge 1', isActive: true, requiresPrescription: false, isControlledSubstance: false, notes: 'Refrigerate 2-8°C', createdAt: daysAgo(180), updatedAt: daysAgo(14) },
  { id: invId(5), sku: 'VAC-003', name: 'FVRCP Vaccine', description: 'Feline viral rhinotracheitis/calicivirus/panleukopenia', category: 'vaccine' as const, unit: 'dose' as const, manufacturer: 'Boehringer Ingelheim', supplier: 'MWI Animal Health', costPrice: 5.50, sellingPrice: 35.00, quantityOnHand: 25, reorderLevel: 10, reorderQuantity: 30, lotNumber: 'FV-26-0817', expirationDate: daysFromNow(200).slice(0, 10), location: 'Fridge 1', isActive: true, requiresPrescription: false, isControlledSubstance: false, notes: null, createdAt: daysAgo(175), updatedAt: daysAgo(3) },
  { id: invId(6), sku: 'MED-003', name: 'Cerenia 24mg', description: 'Anti-nausea (maropitant citrate)', category: 'medication' as const, unit: 'tablet' as const, manufacturer: 'Zoetis', supplier: 'VetSource', costPrice: 3.50, sellingPrice: 8.00, quantityOnHand: 3, reorderLevel: 20, reorderQuantity: 60, lotNumber: 'CE-25-9901', expirationDate: daysFromNow(90).slice(0, 10), location: 'Shelf A-3', isActive: true, requiresPrescription: true, isControlledSubstance: false, notes: 'LOW STOCK — reorder immediately', createdAt: daysAgo(160), updatedAt: daysAgo(1) },
  { id: invId(7), sku: 'SUP-001', name: 'IV Catheter 20G', description: 'Peripheral IV catheter', category: 'surgical_supply' as const, unit: 'unit' as const, manufacturer: 'Terumo', supplier: 'Henry Schein', costPrice: 2.80, sellingPrice: 12.00, quantityOnHand: 4, reorderLevel: 15, reorderQuantity: 50, lotNumber: null, expirationDate: null, location: 'Supply Room B', isActive: true, requiresPrescription: false, isControlledSubstance: false, notes: 'LOW STOCK', createdAt: daysAgo(200), updatedAt: daysAgo(2) },
  { id: invId(8), sku: 'MED-004', name: 'Dexmedetomidine 0.5mg/ml', description: 'Sedative for procedures', category: 'medication' as const, unit: 'vial' as const, manufacturer: 'Zoetis', supplier: 'VetSource', costPrice: 45.00, sellingPrice: 95.00, quantityOnHand: 8, reorderLevel: 5, reorderQuantity: 10, lotNumber: 'DX-26-0312', expirationDate: daysFromNow(270).slice(0, 10), location: 'Controlled Cabinet', isActive: true, requiresPrescription: true, isControlledSubstance: true, notes: 'DEA Schedule — log each use', createdAt: daysAgo(150), updatedAt: daysAgo(7) },
  { id: invId(9), sku: 'MED-005', name: 'Heartgard Plus (51-100 lbs)', description: 'Monthly heartworm prevention chewable', category: 'medication' as const, unit: 'dose' as const, manufacturer: 'Boehringer Ingelheim', supplier: 'MWI Animal Health', costPrice: 8.00, sellingPrice: 18.50, quantityOnHand: 60, reorderLevel: 20, reorderQuantity: 60, lotNumber: 'HG-26-4410', expirationDate: daysFromNow(400).slice(0, 10), location: 'Shelf B-1', isActive: true, requiresPrescription: true, isControlledSubstance: false, notes: null, createdAt: daysAgo(120), updatedAt: daysAgo(15) },
  { id: invId(10), sku: 'MED-006', name: 'NexGard 24.1-60 lbs', description: 'Monthly flea & tick chewable (afoxolaner)', category: 'medication' as const, unit: 'dose' as const, manufacturer: 'Boehringer Ingelheim', supplier: 'MWI Animal Health', costPrice: 12.00, sellingPrice: 24.00, quantityOnHand: 45, reorderLevel: 15, reorderQuantity: 50, lotNumber: 'NG-26-5523', expirationDate: daysFromNow(350).slice(0, 10), location: 'Shelf B-1', isActive: true, requiresPrescription: true, isControlledSubstance: false, notes: null, createdAt: daysAgo(120), updatedAt: daysAgo(20) },
  { id: invId(11), sku: 'SUP-002', name: 'Surgical Gloves (M)', description: 'Sterile latex-free surgical gloves', category: 'surgical_supply' as const, unit: 'box' as const, manufacturer: 'Ansell', supplier: 'Henry Schein', costPrice: 18.00, sellingPrice: 0, quantityOnHand: 24, reorderLevel: 10, reorderQuantity: 30, lotNumber: null, expirationDate: null, location: 'Supply Room A', isActive: true, requiresPrescription: false, isControlledSubstance: false, notes: 'Internal use only', createdAt: daysAgo(100), updatedAt: daysAgo(30) },
  { id: invId(12), sku: 'FOOD-001', name: 'Hill\'s i/d Digestive Care', description: 'Prescription GI diet — canine', category: 'food' as const, unit: 'bottle' as const, manufacturer: 'Hill\'s Pet Nutrition', supplier: 'Hill\'s Direct', costPrice: 42.00, sellingPrice: 68.00, quantityOnHand: 12, reorderLevel: 5, reorderQuantity: 15, lotNumber: null, expirationDate: daysFromNow(500).slice(0, 10), location: 'Shelf C-1', isActive: true, requiresPrescription: true, isControlledSubstance: false, notes: null, createdAt: daysAgo(90), updatedAt: daysAgo(10) },
];

// ── Notifications ──
export const notifications = [
  { id: nid(1), type: 'vaccination_due' as const, priority: 'high' as const, title: 'Rabies Vaccine Due', message: 'Cooper (Anderson) — Rabies vaccine due in 3 days', referenceId: pid(11), referenceType: 'patient', isRead: false, isDismissed: false, createdAt: daysAgo(0) },
  { id: nid(2), type: 'low_stock' as const, priority: 'urgent' as const, title: 'Critical: Cerenia Low Stock', message: 'Cerenia 24mg — only 3 tablets remaining (reorder level: 20)', referenceId: invId(6), referenceType: 'inventory', isRead: false, isDismissed: false, createdAt: daysAgo(1) },
  { id: nid(3), type: 'low_stock' as const, priority: 'high' as const, title: 'IV Catheter Low Stock', message: 'IV Catheter 20G — only 4 units remaining (reorder level: 15)', referenceId: invId(7), referenceType: 'inventory', isRead: false, isDismissed: false, createdAt: daysAgo(2) },
  { id: nid(4), type: 'invoice_overdue' as const, priority: 'high' as const, title: 'Overdue Invoice', message: 'INV-2026-004 (Brown, Jessica) — $197.00 balance, 15 days overdue', referenceId: iid(4), referenceType: 'invoice', isRead: false, isDismissed: false, createdAt: daysAgo(0) },
  { id: nid(5), type: 'appointment_reminder' as const, priority: 'medium' as const, title: 'Tomorrow: Rocky Check-up', message: 'Rocky (Garcia) scheduled for routine check-up tomorrow at 9:00 AM with Dr. Carter', referenceId: aid(6), referenceType: 'appointment', isRead: false, isDismissed: false, createdAt: daysAgo(0) },
  { id: nid(6), type: 'preventive_care_overdue' as const, priority: 'medium' as const, title: 'Dental Cleaning Overdue', message: 'Cleo (Thomas) — dental cleaning was due 2 weeks ago', referenceId: pid(13), referenceType: 'patient', isRead: true, isDismissed: false, createdAt: daysAgo(3) },
  { id: nid(7), type: 'vaccination_due' as const, priority: 'medium' as const, title: 'FVRCP Booster Due', message: 'Cleo (Thomas) — FVRCP booster due tomorrow', referenceId: pid(13), referenceType: 'patient', isRead: true, isDismissed: false, createdAt: daysAgo(1) },
  { id: nid(8), type: 'system' as const, priority: 'low' as const, title: 'Demo Data Loaded', message: 'Sample data has been loaded successfully for demonstration purposes.', referenceId: null, referenceType: null, isRead: true, isDismissed: false, createdAt: daysAgo(0) },
];

// ── Clinic Settings ──
export const clinicSettings = {
  id: 'settings-1',
  clinicName: 'Springfield Veterinary Clinic',
  phone: '(555) 200-3000',
  email: 'info@springfieldvet.com',
  website: 'https://springfieldvet.com',
  address: '1200 Medical Center Drive',
  city: 'Springfield',
  state: 'IL',
  zipCode: '62701',
  country: 'US',
  timezone: 'America/Chicago',
  currency: 'USD',
  defaultTaxRate: 8,
  appointmentSlotMinutes: 30,
  businessHoursStart: '08:00',
  businessHoursEnd: '18:00',
  closedDays: 'Sunday',
  invoicePaymentTermsDays: 30,
  invoiceFooter: 'Thank you for trusting Springfield Veterinary Clinic with your pet\'s care!',
  logoUrl: null,
  createdAt: daysAgo(365),
  updatedAt: daysAgo(10),
};

// ── Dashboard Stats ──
const todayAppts = appointments.filter((a) => a.startTime.startsWith(today));
export const dashboardStats = {
  totalClients: clients.length,
  totalPatients: patients.length,
  todayAppointments: todayAppts.length,
  openVisits: visits.filter((v) => v.status !== 'completed').length,
  pendingInvoices: invoices.filter((i) => i.status === 'sent' || i.status === 'draft').length,
  outstandingBalance: invoices.reduce((sum, i) => sum + i.balanceDue, 0),
  upcomingVaccinations: 3,
  overduePreventiveCare: 2,
  todaySchedule: todayAppts.map((a) => ({
    id: a.id,
    patientName: a.patient.name,
    clientName: `${a.client.firstName} ${a.client.lastName}`,
    vetName: `Dr. ${a.vet.lastName}`,
    startTime: a.startTime,
    type: a.type,
    status: a.status,
  })),
  recentVisits: visits.slice(0, 4).map((v) => ({
    id: v.id,
    patientName: v.patient.name,
    clientName: `${v.client.firstName} ${v.client.lastName}`,
    chiefComplaint: v.chiefComplaint,
    status: v.status,
    createdAt: v.createdAt,
  })),
};

// ── Exported helpers for mock API lookup ──
export const patientsWithClientRef = patientsWithClient;
