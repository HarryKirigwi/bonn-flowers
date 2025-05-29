import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isAdmin } from '@/lib/api/auth';

const prisma = new PrismaClient();

// POST: Create promotion
export async function POST(req) {
  const user = authenticateToken(req);
  if (!user || !isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const { code, discount, expiryDate } = await req.json();
  const promotion = await prisma.promotion.create({
    data: {
      code,
      discount: parseFloat(discount),
      expiryDate: new Date(expiryDate)
    }
  });
  return NextResponse.json(promotion, { status: 201 });
}

// GET: Get all promotions
export async function GET(req) {
  const user = authenticateToken(req);
  if (!user || !isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const promotions = await prisma.promotion.findMany();
  return NextResponse.json(promotions);
}
