import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface DashboardStats {
  totalClients: number;
  totalPatients: number;
  todayAppointments: number;
  openVisits: number;
  pendingInvoices: number;
  outstandingBalance: number;
  upcomingVaccinations: number;
  overduePreventiveCare: number;
  recentVisits: {
    id: string;
    patientName: string;
    clientName: string;
    chiefComplaint: string | null;
    status: string;
    createdAt: string;
  }[];
  todaySchedule: {
    id: string;
    patientName: string;
    clientName: string;
    vetName: string;
    startTime: string;
    type: string;
    status: string;
  }[];
}

export interface RevenueReport {
  period: string;
  totalInvoiced: number;
  totalCollected: number;
  outstanding: number;
  invoiceCount: number;
}

export interface VisitReport {
  period: string;
  visitCount: number;
  completedCount: number;
}

@Injectable()
export class ReportsService {
  constructor(private readonly dataSource: DataSource) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date().toISOString().split('T')[0];

    const [
      clientCount,
      patientCount,
      todayAppts,
      openVisits,
      pendingInv,
      outstanding,
      upcomingVacc,
      overduePC,
      recentVisits,
      todaySchedule,
    ] = await Promise.all([
      this.dataSource.query(`SELECT COUNT(*) as count FROM clients WHERE "isActive" = true`),
      this.dataSource.query(`SELECT COUNT(*) as count FROM patients WHERE "isActive" = true`),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM appointments WHERE DATE("startTime") = $1 AND status NOT IN ('cancelled', 'no_show')`,
        [today],
      ),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM visits WHERE status IN ('open', 'in_progress')`,
      ),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM invoices WHERE status IN ('draft', 'sent', 'partially_paid', 'overdue')`,
      ),
      this.dataSource.query(
        `SELECT COALESCE(SUM("balanceDue"), 0) as total FROM invoices WHERE status IN ('sent', 'partially_paid', 'overdue')`,
      ),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM vaccinations WHERE status = 'scheduled' AND "nextDueDate" <= (CURRENT_DATE + INTERVAL '30 days')`,
      ),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM preventive_care WHERE status = 'active' AND "nextDueDate" <= CURRENT_DATE`,
      ),
      this.dataSource.query(
        `SELECT v.id, p.name as "patientName",
                CONCAT(c."lastName", ', ', c."firstName") as "clientName",
                v."chiefComplaint", v.status, v."createdAt"
         FROM visits v
         JOIN patients p ON p.id = v."patientId"
         JOIN clients c ON c.id = v."clientId"
         ORDER BY v."createdAt" DESC LIMIT 5`,
      ),
      this.dataSource.query(
        `SELECT a.id, p.name as "patientName",
                CONCAT(c."lastName", ', ', c."firstName") as "clientName",
                CONCAT('Dr. ', u."lastName") as "vetName",
                a."startTime", a.type, a.status
         FROM appointments a
         JOIN patients p ON p.id = a."patientId"
         JOIN clients c ON c.id = a."clientId"
         JOIN users u ON u.id = a."vetId"
         WHERE DATE(a."startTime") = $1
         ORDER BY a."startTime" ASC`,
        [today],
      ),
    ]);

    return {
      totalClients: parseInt(clientCount[0].count, 10),
      totalPatients: parseInt(patientCount[0].count, 10),
      todayAppointments: parseInt(todayAppts[0].count, 10),
      openVisits: parseInt(openVisits[0].count, 10),
      pendingInvoices: parseInt(pendingInv[0].count, 10),
      outstandingBalance: parseFloat(outstanding[0].total),
      upcomingVaccinations: parseInt(upcomingVacc[0].count, 10),
      overduePreventiveCare: parseInt(overduePC[0].count, 10),
      recentVisits,
      todaySchedule,
    };
  }

  async getRevenueReport(startDate: string, endDate: string, groupBy: 'day' | 'week' | 'month' = 'month'): Promise<RevenueReport[]> {
    const dateTrunc = groupBy === 'day' ? 'day' : groupBy === 'week' ? 'week' : 'month';

    const rows = await this.dataSource.query(
      `SELECT
         DATE_TRUNC($1, "issueDate"::timestamp) as period,
         COALESCE(SUM("totalAmount"), 0) as "totalInvoiced",
         COALESCE(SUM("amountPaid"), 0) as "totalCollected",
         COALESCE(SUM("balanceDue"), 0) as outstanding,
         COUNT(*) as "invoiceCount"
       FROM invoices
       WHERE "issueDate" >= $2 AND "issueDate" <= $3
         AND status != 'cancelled'
       GROUP BY period
       ORDER BY period ASC`,
      [dateTrunc, startDate, endDate],
    );

    return rows.map((r: any) => ({
      period: r.period,
      totalInvoiced: parseFloat(r.totalInvoiced),
      totalCollected: parseFloat(r.totalCollected),
      outstanding: parseFloat(r.outstanding),
      invoiceCount: parseInt(r.invoiceCount, 10),
    }));
  }

  async getVisitReport(startDate: string, endDate: string, groupBy: 'day' | 'week' | 'month' = 'month'): Promise<VisitReport[]> {
    const dateTrunc = groupBy === 'day' ? 'day' : groupBy === 'week' ? 'week' : 'month';

    const rows = await this.dataSource.query(
      `SELECT
         DATE_TRUNC($1, "createdAt") as period,
         COUNT(*) as "visitCount",
         COUNT(*) FILTER (WHERE status = 'completed') as "completedCount"
       FROM visits
       WHERE "createdAt" >= $2 AND "createdAt" <= $3
       GROUP BY period
       ORDER BY period ASC`,
      [dateTrunc, startDate, endDate],
    );

    return rows.map((r: any) => ({
      period: r.period,
      visitCount: parseInt(r.visitCount, 10),
      completedCount: parseInt(r.completedCount, 10),
    }));
  }

  async getVaccinationsDueReport(daysAhead: number = 30): Promise<any[]> {
    return this.dataSource.query(
      `SELECT v.id, v."vaccineName", v."nextDueDate", v.status,
              p.name as "patientName", p.species,
              CONCAT(c."lastName", ', ', c."firstName") as "clientName",
              c.phone as "clientPhone"
       FROM vaccinations v
       JOIN patients p ON p.id = v."patientId"
       JOIN clients c ON c.id = p."clientId"
       WHERE v.status = 'scheduled'
         AND v."nextDueDate" <= (CURRENT_DATE + ($1 || ' days')::interval)
       ORDER BY v."nextDueDate" ASC`,
      [daysAhead],
    );
  }

  async getTopServicesByRevenue(startDate: string, endDate: string, limit: number = 10): Promise<any[]> {
    return this.dataSource.query(
      `SELECT
         ii.description,
         ii.category,
         SUM(ii.quantity) as "totalQuantity",
         SUM(ii."lineTotal") as "totalRevenue",
         COUNT(DISTINCT ii."invoiceId") as "invoiceCount"
       FROM invoice_items ii
       JOIN invoices i ON i.id = ii."invoiceId"
       WHERE i."issueDate" >= $1 AND i."issueDate" <= $2
         AND i.status != 'cancelled'
       GROUP BY ii.description, ii.category
       ORDER BY "totalRevenue" DESC
       LIMIT $3`,
      [startDate, endDate, limit],
    );
  }
}
