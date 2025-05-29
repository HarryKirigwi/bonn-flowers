import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Get reviews for a product
export async function GET(req, { params }) {
  const reviews = await prisma.review.findMany({
    where: { productId: parseInt(params.id) },
    include: { user: { select: { name: true } } }
  });
  return NextResponse.json(reviews);
}
