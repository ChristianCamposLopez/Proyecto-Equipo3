// app/api/stats/revenue-by-category/route.ts
import { NextRequest } from 'next/server';
import { getRevenueByCategory } from '@/controllers/statsController';

export async function GET(req: NextRequest) {
  return getRevenueByCategory(req);
}
