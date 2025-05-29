import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isAdmin } from '@/lib/api/auth';

const prisma = new PrismaClient();

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const category = searchParams.get('category');
  const occasion = searchParams.get('occasion');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  let where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }
  if (category) where.categoryId = parseInt(category);
  if (occasion) where.attributes = { equals: { occasion } };
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  const products = await prisma.product.findMany({
    where,
    include: { 
      category: true,
      reviews: { select: { id: true, rating: true, comment: true } }
    }
  });

  // Transform the data to match what the frontend component expects
  const transformedProducts = products.map(product => {
    // Calculate average rating
    const avgRating = product.reviews.length > 0 
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description || '',
      imageUrl: product.imageUrl,
      stock: product.stock,
      stockQuantity: product.stock, // Alias for compatibility
      inStock: product.stock > 0,
      
      // Transform category object to string
      category: product.category?.name || 'Uncategorized',
      categoryId: product.categoryId,
      
      // Use existing fields or provide defaults
      subcategory: product.subcategory || '',
      color: product.color || 'Mixed',
      
      // Extract attributes or provide defaults
      origin: product.attributes?.origin || 'Local',
      seasonality: product.attributes?.seasonality || 'Year-round',
      vaseLife: product.attributes?.vaseLife || '5-7 days',
      care: product.attributes?.care || 'Keep in cool water, trim stems regularly',
      tags: product.attributes?.tags || [product.category?.name?.toLowerCase()].filter(Boolean),
      
      // Review data
      rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
      reviews: product.reviews.length,
      
      // Additional fields the component expects
      featured: product.attributes?.featured || false,
      gallery: product.attributes?.gallery || [],
      
      createdAt: product.createdAt
    };
  });

  return NextResponse.json(transformedProducts);
}

export async function POST(req) {
  const user = authenticateToken(req);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  const { 
    name, 
    price, 
    description, 
    stock, 
    categoryId, 
    subcategory,
    color,
    attributes, 
    imageUrl 
  } = await req.json();
  
  const product = await prisma.product.create({
    data: {
      name,
      price: parseFloat(price),
      description,
      imageUrl: imageUrl || '',
      stock: parseInt(stock),
      categoryId: parseInt(categoryId),
      subcategory: subcategory || null,
      color: color || null,
      attributes: attributes || {}
    },
    include: {
      category: true
    }
  });
  
  return NextResponse.json(product, { status: 201 });
}