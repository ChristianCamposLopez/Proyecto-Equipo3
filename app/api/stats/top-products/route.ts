// app/api/stats/top-products/route.ts
import { NextRequest } from 'next/server';
import { getTopProducts } from '@/controllers/statsController';

export async function GET(req: NextRequest) {
  return getTopProducts(req);
}
