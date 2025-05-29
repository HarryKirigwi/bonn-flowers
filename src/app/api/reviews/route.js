import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '@/lib/api/auth';

const prisma = new PrismaClient();

// POST: Create review
export async function POST(req) {
  const user = authenticateToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { productId, rating, comment } = await req.json();
  const review = await prisma.review.create({
    data: {
      userId: user.userId,
      productId: parseInt(productId),
      rating: parseInt(rating),
      comment
    }
  });
  return NextResponse.json(review, { status: 201 });
}
