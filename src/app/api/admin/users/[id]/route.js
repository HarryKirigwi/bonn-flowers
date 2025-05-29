import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isAdmin } from '@/lib/api/auth';

const prisma = new PrismaClient();

// PATCH: Admin update user
export async function PATCH(req, { params }) {
  const user = authenticateToken(req);
  if (!user || !isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const { name, email, role } = await req.json();
  const updatedUser = await prisma.user.update({
    where: { id: parseInt(params.id) },
    data: { name, email, role },
    select: { id: true, email: true, name: true, role: true }
  });
  return NextResponse.json(updatedUser);
}
