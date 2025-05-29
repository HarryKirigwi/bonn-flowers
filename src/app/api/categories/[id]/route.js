import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isAdmin } from '@/lib/api/auth';

const prisma = new PrismaClient();

export async function PATCH(req, { params }) {
  const user = authenticateToken(req);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { name } = await req.json();
  const category = await prisma.category.update({
    where: { id: parseInt(params.id) },
    data: { name }
  });
  return NextResponse.json(category);
}

export async function DELETE(req, { params }) {
  const user = authenticateToken(req);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  await prisma.category.delete({ where: { id: parseInt(params.id) } });
  return NextResponse.json({}, { status: 204 });
}
