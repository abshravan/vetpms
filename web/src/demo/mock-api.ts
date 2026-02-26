import {
  clients,
  patients,
  patientsWithClientRef,
  appointments,
  visits,
  invoices,
  inventoryItems,
  notifications,
  users,
  clinicSettings,
  dashboardStats,
} from './mock-data';

// ── Helpers ──

function paginate<T>(items: T[], params: URLSearchParams) {
  const page = Number(params.get('page') || '1');
  const limit = Number(params.get('limit') || '10');
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    total: items.length,
    page,
    limit,
    totalPages: Math.ceil(items.length / limit),
  };
}

function searchFilter<T>(items: T[], search: string | null, fields: (keyof T)[]) {
  if (!search) return items;
  const q = search.toLowerCase();
  return items.filter((item) =>
    fields.some((f) => {
      const v = item[f];
      return typeof v === 'string' && v.toLowerCase().includes(q);
    }),
  );
}

// ── Route matching ──

type MockHandler = (pathParts: string[], params: URLSearchParams) => unknown;

const routes: { method: string; pattern: RegExp; handler: MockHandler }[] = [
  // ── Dashboard ──
  {
    method: 'get',
    pattern: /^\/dashboard\/stats$/,
    handler: () => dashboardStats,
  },

  // ── Clients ──
  {
    method: 'get',
    pattern: /^\/clients$/,
    handler: (_parts, params) => {
      const filtered = searchFilter(clients, params.get('search'), ['firstName', 'lastName', 'email', 'phone']);
      return paginate(filtered, params);
    },
  },
  {
    method: 'get',
    pattern: /^\/clients\/([^/]+)$/,
    handler: (parts) => {
      const c = clients.find((cl) => cl.id === parts[1]);
      return c || clients[0];
    },
  },

  // ── Patients ──
  {
    method: 'get',
    pattern: /^\/patients$/,
    handler: (_parts, params) => {
      let filtered = [...patientsWithClientRef];
      const species = params.get('species');
      if (species) filtered = filtered.filter((p) => p.species === species);
      filtered = searchFilter(filtered, params.get('search'), ['name', 'breed']);
      return paginate(filtered, params);
    },
  },
  {
    method: 'get',
    pattern: /^\/patients\/([^/]+)$/,
    handler: (parts) => {
      const p = patientsWithClientRef.find((pt) => pt.id === parts[1]);
      return p || patientsWithClientRef[0];
    },
  },

  // ── Appointments ──
  {
    method: 'get',
    pattern: /^\/appointments$/,
    handler: (_parts, params) => {
      let filtered = [...appointments];
      const vetId = params.get('vetId');
      if (vetId) filtered = filtered.filter((a) => a.vetId === vetId);
      const status = params.get('status');
      if (status) filtered = filtered.filter((a) => a.status === status);
      return paginate(filtered, params);
    },
  },
  {
    method: 'get',
    pattern: /^\/appointments\/day\/(.+)$/,
    handler: (parts) => {
      const date = parts[1];
      return appointments.filter((a) => a.startTime.startsWith(date));
    },
  },
  {
    method: 'get',
    pattern: /^\/appointments\/([^/]+)$/,
    handler: (parts) => {
      const a = appointments.find((ap) => ap.id === parts[1]);
      return a || appointments[0];
    },
  },

  // ── Visits ──
  {
    method: 'get',
    pattern: /^\/visits\/patient\/([^/]+)$/,
    handler: (parts) => visits.filter((v) => v.patientId === parts[1]),
  },
  {
    method: 'get',
    pattern: /^\/visits\/([^/]+)\/notes$/,
    handler: (parts) => {
      const v = visits.find((vs) => vs.id === parts[1]);
      return v?.clinicalNotes || [];
    },
  },
  {
    method: 'get',
    pattern: /^\/visits\/([^/]+)\/treatments$/,
    handler: () => [],
  },
  {
    method: 'get',
    pattern: /^\/visits\/([^/]+)$/,
    handler: (parts) => {
      const v = visits.find((vs) => vs.id === parts[1]);
      return v || visits[0];
    },
  },

  // ── Invoices (Billing) ──
  {
    method: 'get',
    pattern: /^\/invoices$/,
    handler: (_parts, params) => {
      const filtered = searchFilter(invoices, params.get('search'), ['invoiceNumber']);
      return paginate(filtered, params);
    },
  },
  {
    method: 'get',
    pattern: /^\/invoices\/([^/]+)$/,
    handler: (parts) => {
      const inv = invoices.find((i) => i.id === parts[1]);
      return inv || invoices[0];
    },
  },
  {
    method: 'get',
    pattern: /^\/clients\/([^/]+)\/invoices$/,
    handler: (parts) => invoices.filter((i) => i.clientId === parts[1]),
  },
  {
    method: 'get',
    pattern: /^\/patients\/([^/]+)\/invoices$/,
    handler: (parts) => invoices.filter((i) => i.patientId === parts[1]),
  },

  // ── Inventory (Pharmacy) ──
  {
    method: 'get',
    pattern: /^\/inventory\/low-stock$/,
    handler: () => inventoryItems.filter((i) => i.quantityOnHand <= i.reorderLevel),
  },
  {
    method: 'get',
    pattern: /^\/inventory\/expiring$/,
    handler: () => inventoryItems.filter((i) => i.expirationDate !== null).slice(0, 5),
  },
  {
    method: 'get',
    pattern: /^\/inventory\/([^/]+)\/transactions$/,
    handler: () => ({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
  },
  {
    method: 'get',
    pattern: /^\/inventory$/,
    handler: (_parts, params) => {
      let filtered = [...inventoryItems];
      const category = params.get('category');
      if (category) filtered = filtered.filter((i) => i.category === category);
      const lowStock = params.get('lowStock');
      if (lowStock === 'true') filtered = filtered.filter((i) => i.quantityOnHand <= i.reorderLevel);
      filtered = searchFilter(filtered, params.get('search'), ['name', 'sku', 'description']);
      return paginate(filtered, params);
    },
  },
  {
    method: 'get',
    pattern: /^\/inventory\/([^/]+)$/,
    handler: (parts) => {
      const item = inventoryItems.find((i) => i.id === parts[1]);
      return item || inventoryItems[0];
    },
  },

  // ── Notifications ──
  {
    method: 'get',
    pattern: /^\/notifications\/unread-count$/,
    handler: () => notifications.filter((n) => !n.isRead).length,
  },
  {
    method: 'get',
    pattern: /^\/notifications$/,
    handler: (_parts, params) => {
      let filtered = [...notifications];
      if (params.get('unreadOnly') === 'true') filtered = filtered.filter((n) => !n.isRead);
      return paginate(filtered, params);
    },
  },

  // ── Users ──
  {
    method: 'get',
    pattern: /^\/users$/,
    handler: () => users,
  },
  {
    method: 'get',
    pattern: /^\/users\/([^/]+)$/,
    handler: (parts) => {
      const u = users.find((us) => us.id === parts[1]);
      return u || users[0];
    },
  },

  // ── Settings ──
  {
    method: 'get',
    pattern: /^\/settings$/,
    handler: () => clinicSettings,
  },

  // ── Reports ──
  {
    method: 'get',
    pattern: /^\/reports\/revenue$/,
    handler: () => {
      const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
      return months.map((m, i) => ({
        period: m,
        totalInvoiced: 3200 + Math.round(Math.sin(i * 1.2) * 1200 + i * 400),
        totalCollected: 2800 + Math.round(Math.sin(i * 1.2) * 1000 + i * 350),
        outstanding: 400 + Math.round(Math.abs(Math.sin(i * 0.8)) * 500),
        invoiceCount: 8 + i * 2,
      }));
    },
  },
  {
    method: 'get',
    pattern: /^\/reports\/visits$/,
    handler: () => {
      const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
      return months.map((m, i) => ({
        period: m,
        visitCount: 12 + Math.round(Math.sin(i * 0.9) * 5 + i * 2),
        completedCount: 10 + Math.round(Math.sin(i * 0.9) * 4 + i * 2),
      }));
    },
  },
  {
    method: 'get',
    pattern: /^\/reports\/vaccinations-due$/,
    handler: () => [
      { id: '1', vaccineName: 'Rabies', nextDueDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10), status: 'scheduled', patientName: 'Cooper', species: 'dog', clientName: 'Sarah Anderson', clientPhone: '(555) 789-0123' },
      { id: '2', vaccineName: 'FVRCP', nextDueDate: new Date(Date.now() + 1 * 86400000).toISOString().slice(0, 10), status: 'scheduled', patientName: 'Cleo', species: 'cat', clientName: 'Karen Thomas', clientPhone: '(555) 901-2345' },
      { id: '3', vaccineName: 'DHPP', nextDueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10), status: 'scheduled', patientName: 'Rocky', species: 'dog', clientName: 'Robert Garcia', clientPhone: '(555) 456-7890' },
    ],
  },
  {
    method: 'get',
    pattern: /^\/reports\/top-services$/,
    handler: () => [
      { description: 'Office Visit', category: 'exam', totalQuantity: 18, totalRevenue: 1170, invoiceCount: 18 },
      { description: 'Rabies Vaccine', category: 'vaccine', totalQuantity: 12, totalRevenue: 300, invoiceCount: 12 },
      { description: 'DHPP Vaccine', category: 'vaccine', totalQuantity: 8, totalRevenue: 256, invoiceCount: 8 },
      { description: 'Dental Cleaning', category: 'procedure', totalQuantity: 5, totalRevenue: 750, invoiceCount: 5 },
      { description: 'Radiographs (2 views)', category: 'imaging', totalQuantity: 4, totalRevenue: 720, invoiceCount: 4 },
    ],
  },

  // ── Treatments & Vaccinations ──
  {
    method: 'get',
    pattern: /^\/patients\/([^/]+)\/vaccinations$/,
    handler: () => [],
  },
  {
    method: 'get',
    pattern: /^\/patients\/([^/]+)\/treatments$/,
    handler: () => [],
  },
  {
    method: 'get',
    pattern: /^\/patients\/([^/]+)\/preventive-care$/,
    handler: () => [],
  },
  {
    method: 'get',
    pattern: /^\/vaccinations\/upcoming$/,
    handler: () => [],
  },
  {
    method: 'get',
    pattern: /^\/preventive-care-overdue$/,
    handler: () => [],
  },

  // ── Audit ──
  {
    method: 'get',
    pattern: /^\/audit$/,
    handler: () => ({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
  },

  // ── Seed (no-op in demo mode) ──
  {
    method: 'post',
    pattern: /^\/seed\/demo$/,
    handler: () => ({ success: true, message: 'Demo mode — using client-side mock data' }),
  },

  // ── Catch-all POST/PATCH/DELETE — return success ──
  {
    method: 'post',
    pattern: /^\/notifications\/generate$/,
    handler: () => ({ created: 0 }),
  },
  {
    method: 'post',
    pattern: /^\/notifications\/.+\/read$/,
    handler: () => ({ success: true }),
  },
  {
    method: 'post',
    pattern: /^\/notifications\/mark-all-read$/,
    handler: () => ({ success: true }),
  },
];

/**
 * Handle a mock API request. Returns the mock data if a route matches,
 * or undefined if no route matches (let the real request proceed).
 */
export function handleMockRequest(method: string, url: string): unknown | undefined {
  // Strip baseURL prefix (axios prepends /api)
  const path = url.startsWith('/api') ? url.slice(4) : url;
  const [pathOnly, queryString] = path.split('?');
  const params = new URLSearchParams(queryString || '');
  const lowerMethod = method.toLowerCase();

  for (const route of routes) {
    if (route.method !== lowerMethod) continue;
    const match = pathOnly.match(route.pattern);
    if (match) {
      return route.handler(Array.from(match), params);
    }
  }

  // For unmatched POST/PATCH/DELETE in demo mode, return a generic success
  if (['post', 'patch', 'put', 'delete'].includes(lowerMethod)) {
    return { success: true };
  }

  // For unmatched GETs, return empty
  return [];
}
