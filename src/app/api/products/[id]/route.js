import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isAdmin } from '@/lib/api/auth';

const prisma = new PrismaClient();

export async function PATCH(req, { params }) {
  const user = authenticateToken(req);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { name, price, description, stock, categoryId, attributes, imageUrl } = await req.json();
  const data = {};
  if (name) data.name = name;
  if (price) data.price = parseFloat(price);
  if (description) data.description = description;
  if (imageUrl) data.imageUrl = imageUrl;
  if (stock) data.stock = parseInt(stock);
  if (categoryId) data.categoryId = parseInt(categoryId);
  if (attributes) data.attributes = attributes;
  const product = await prisma.product.update({
    where: { id: parseInt(params.id) },
    data
  });
  return NextResponse.json(product);
}

export async function DELETE(req, { params }) {
  const user = authenticateToken(req);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  await prisma.product.delete({ where: { id: parseInt(params.id) } });
  return NextResponse.json({}, { status: 204 });
}
