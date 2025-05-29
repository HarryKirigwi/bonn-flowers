import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '@/lib/api/auth';

const prisma = new PrismaClient();

// POST: Add to cart (for demo, store in DB, not Redis)
export async function POST(req) {
  const user = authenticateToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { productId, quantity } = await req.json();
  // For demo: create a CartItem model or just return success
  return NextResponse.json({ productId, quantity }, { status: 201 });
}

// GET: Get cart items (for demo, return empty array)
export async function GET(req) {
  const user = authenticateToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // For demo: return empty cart
  return NextResponse.json([]);
}
