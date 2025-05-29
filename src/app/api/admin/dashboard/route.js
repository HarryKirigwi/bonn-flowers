import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isAdmin } from '@/lib/api/auth';

const prisma = new PrismaClient();

// GET: Admin dashboard stats
export async function GET(req) {
  const user = authenticateToken(req);
  if (!user || !isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const [totalOrders, totalRevenue, lowStockItems] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.product.findMany({ where: { stock: { lte: 10 } } })
  ]);
  return NextResponse.json({
    totalOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    lowStockItems
  });
}
