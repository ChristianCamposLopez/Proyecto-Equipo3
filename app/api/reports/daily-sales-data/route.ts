// app/api/reports/daily-sales-data/route.ts
import { NextRequest } from 'next/server';
import { getDailySalesReport } from '@/controllers/reportController';

export async function GET(req: NextRequest) {
  return getDailySalesReport(req);
}
