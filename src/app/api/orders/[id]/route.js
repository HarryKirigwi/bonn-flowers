import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '@/lib/api/auth';

const prisma = new PrismaClient();

// GET: Get single order by id
export async function GET(req, { params }) {
  const user = authenticateToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const order = await prisma.order.findUnique({
    where: { id: parseInt(params.id), userId: user.userId },
    include: { orderItems: { include: { product: true } } }
  });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  return NextResponse.json(order);
}
