// app/api/reports/daily-sales-excel/route.ts
import { NextRequest } from 'next/server';
import { exportDailySalesExcel } from '@/controllers/reportController';

export async function GET(req: NextRequest) {
  return exportDailySalesExcel(req);
}
