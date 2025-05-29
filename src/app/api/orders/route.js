import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '@/lib/api/auth';
import { sendOrderConfirmation, sendOrderNotificationToAdmin } from '@/lib/utils/email';

const prisma = new PrismaClient();

// POST: Create order
export async function POST(req) {
  const user = authenticateToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { shippingAddress, items, orderNumber, deliveryFee } = await req.json();
  const order = await prisma.order.create({
    data: {
      userId: user.userId,
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0) + (deliveryFee || 0),
      status: 'Pending',
      shippingAddress,
      orderNumber,
      deliveryFee,
      orderItems: {
        create: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }))
      }
    },
    include: { orderItems: { include: { product: true } } }
  });

  // Send emails (do not block response on error)
  sendOrderConfirmation({
    to: shippingAddress.email,
    name: shippingAddress.name,
    orderNumber: order.orderNumber || order.id
  }).catch(() => {});
  sendOrderNotificationToAdmin({ order }).catch(() => {});

  return NextResponse.json({ success: true, order }, { status: 201 });
}

// GET: Get user orders
export async function GET(req) {
  const user = authenticateToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orders = await prisma.order.findMany({
    where: { userId: user.userId },
    include: { orderItems: { include: { product: true } } }
  });
  return NextResponse.json(orders);
}
