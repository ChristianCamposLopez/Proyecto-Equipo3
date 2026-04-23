// app/api/stats/overview/route.ts
import { NextRequest } from 'next/server';
import { getSalesOverview } from '@/controllers/statsController';

export async function GET(req: NextRequest) {
  return getSalesOverview(req);
}
