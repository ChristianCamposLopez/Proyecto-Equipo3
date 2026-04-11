// app/api/stats/daily-sales/route.ts
import { NextRequest } from 'next/server';
import { getDailySalesStats } from '@/controllers/statsController';

export async function GET(req: NextRequest) {
  return getDailySalesStats(req);
}
