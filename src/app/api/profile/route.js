import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '@/lib/api/auth';

const prisma = new PrismaClient();

// GET: Get user profile
export async function GET(req) {
  const user = authenticateToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { id: true, email: true, name: true, role: true }
  });
  return NextResponse.json(dbUser);
}

// PATCH: Update user profile
export async function PATCH(req) {
  const user = authenticateToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name, email } = await req.json();
  // Check for email conflict
  if (email) {
    const existingUser = await prisma.user.findFirst({
      where: { email, NOT: { id: user.userId } }
    });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }
  }
  const updatedUser = await prisma.user.update({
    where: { id: user.userId },
    data: { name, email },
    select: { id: true, email: true, name: true, role: true }
  });
  return NextResponse.json(updatedUser);
}
