import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isAdmin } from '@/lib/api/auth';

const prisma = new PrismaClient();

// GET: Get all orders (admin)
export async function GET(req) {
  const user = authenticateToken(req);
  if (!user || !isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const orders = await prisma.order.findMany({
    include: { orderItems: { include: { product: true } }, user: true }
  });
  return NextResponse.json(orders);
}
