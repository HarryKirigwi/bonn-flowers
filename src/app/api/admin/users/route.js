import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isAdmin } from '@/lib/api/auth';

const prisma = new PrismaClient();

// GET: Admin get all users
export async function GET(req) {
  const user = authenticateToken(req);
  if (!user || !isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true }
  });
  return NextResponse.json(users);
}
