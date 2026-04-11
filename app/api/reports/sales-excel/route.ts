// app/api/reports/sales-excel/route.ts
import { NextRequest } from 'next/server';
import { exportSalesExcel } from '@/controllers/reportController';

export async function GET(req: NextRequest) {
  return exportSalesExcel(req);
}
