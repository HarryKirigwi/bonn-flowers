import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// IDs of featured products
const FEATURED_IDS = [10, 14, 5, 4, 8, 9, 2, 3];

export async function GET() {
  const products = await prisma.product.findMany({
    where: { id: { in: FEATURED_IDS } },
    include: {
      category: true,
      reviews: { select: { id: true, rating: true, comment: true } }
    },
    orderBy: [{
      // Maintain the order of FEATURED_IDS
      id: 'asc'
    }]
  });
  // Sort to match FEATURED_IDS order
  const sorted = FEATURED_IDS.map(id => products.find(p => p.id === id)).filter(Boolean);
  return NextResponse.json(sorted);
}
