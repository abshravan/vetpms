import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard/stats')
  async getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }

  @Get('reports/revenue')
  async getRevenueReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('groupBy') groupBy?: 'day' | 'week' | 'month',
  ) {
    return this.reportsService.getRevenueReport(startDate, endDate, groupBy);
  }

  @Get('reports/visits')
  async getVisitReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('groupBy') groupBy?: 'day' | 'week' | 'month',
  ) {
    return this.reportsService.getVisitReport(startDate, endDate, groupBy);
  }

  @Get('reports/vaccinations-due')
  async getVaccinationsDue(@Query('days') days?: string) {
    return this.reportsService.getVaccinationsDueReport(days ? parseInt(days, 10) : 30);
  }

  @Get('reports/top-services')
  async getTopServices(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportsService.getTopServicesByRevenue(startDate, endDate, limit ? parseInt(limit, 10) : 10);
  }
}
