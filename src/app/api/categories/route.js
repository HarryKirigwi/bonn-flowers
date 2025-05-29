import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isAdmin } from '@/lib/api/auth';

const prisma = new PrismaClient();

export async function GET() {
  const categories = await prisma.category.findMany();
  return NextResponse.json(categories);
}

export async function POST(req) {
  const user = authenticateToken(req);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { name } = await req.json();
  const category = await prisma.category.create({ data: { name } });
  return NextResponse.json(category, { status: 201 });
}
