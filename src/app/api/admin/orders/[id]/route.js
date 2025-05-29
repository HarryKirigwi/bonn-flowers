import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isAdmin } from '@/lib/api/auth';

const prisma = new PrismaClient();

// PATCH: Update order status (admin)
export async function PATCH(req, { params }) {
  const user = authenticateToken(req);
  if (!user || !isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const { status } = await req.json();
  const order = await prisma.order.update({
    where: { id: parseInt(params.id) },
    data: { status }
  });
  return NextResponse.json(order);
}
