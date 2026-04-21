// app/api/reports/daily-sales-csv/route.ts
import { NextRequest } from 'next/server';
import { exportDailySalesCSV } from '@/controllers/reportController';

export async function GET(req: NextRequest) {
  return exportDailySalesCSV(req);
}
