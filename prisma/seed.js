// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

// --- Flower Products Data ---
const flowerProducts = [
  {
    id: 1,
    name: "White Delphiniums",
    description: "Elegant white delphiniums with tall, graceful spikes. Perfect for weddings and formal bouquets.",
    price: 32,
    category: "Delphiniums",
    subcategory: "Premium Stems",
    color: "White",
    image: "/images/products/whitedelphiniums.jpg",
    gallery: [
      "/images/products/whitedelphiniums.jpg",
      "/images/products/babybluedelphiniumsbetter.jpg"
    ],
    inStock: true,
    stockQuantity: 150,
    featured: true,
    rating: 4.9,
    reviews: 47,
    origin: "Kenya Highlands",
    seasonality: "Year-round",
    vaseLife: "7-10 days",
    care: "Keep in cool water, trim stems regularly",
    tags: ["wedding", "formal", "tall", "elegant", "white"]
  },
  {
    id: 2,
    name: "Blue Delphiniums",
    description: "Deep blue delphiniums that add dramatic color to any arrangement. Great for garden-style bouquets.",
    price: 32,
    category: "Delphiniums",
    subcategory: "Premium Stems",
    color: "Blue",
    image: "/images/products/bluedelphiniums.jpg",
    gallery: [
      "/images/products/bluedelphiniums.jpg",
      "/images/products/whitedelphiniumsbetter.jpg"
    ],
    inStock: true,
    stockQuantity: 120,
    featured: true,
    rating: 4.8,
    reviews: 38,
    origin: "Kenya Highlands",
    seasonality: "Year-round",
    vaseLife: "7-10 days",
    care: "Keep in cool water, trim stems regularly",
    tags: ["blue", "dramatic", "tall", "garden-style", "colorful"]
  },
  {
    id: 3,
    name: "Baby Blue Delphiniums",
    description: "Soft baby blue delphiniums for pastel and romantic arrangements. Ideal for baby showers and gentle designs.",
    price: 32,
    category: "Delphiniums",
    subcategory: "Premium Stems",
    color: "Baby Blue",
    image: "/images/products/babybluedelphiniumsbetter.jpg",
    gallery: [
      "/images/products/babybluedelphiniumsbetter.jpg",
      "/images/products/bluedelphiniums.jpg"
    ],
    inStock: true,
    stockQuantity: 100,
    featured: true,
    rating: 4.7,
    reviews: 29,
    origin: "Kenya Highlands",
    seasonality: "Year-round",
    vaseLife: "7-10 days",
    care: "Keep in cool water, trim stems regularly",
    tags: ["baby-blue", "pastel", "romantic", "soft", "delicate"]
  },
  {
    id: 4,
    name: "Proteas Safari Sunset",
    description: "Exotic proteas with sunset hues. Adds a wild, unique touch to any bouquet or arrangement.",
    price: 52,
    category: "Proteas",
    subcategory: "Exotic Flowers",
    color: "Sunset Orange",
    image: "/images/products/proteassafari.jpg",
    gallery: [
      "/images/products/proteassafari.jpg"
    ],
    inStock: true,
    stockQuantity: 80,
    featured: true,
    rating: 4.9,
    reviews: 52,
    origin: "South Africa",
    seasonality: "Year-round",
    vaseLife: "14-21 days",
    care: "Minimal water, excellent for dried arrangements",
    tags: ["exotic", "unique", "long-lasting", "sunset", "wild"]
  },
  {
    id: 5,
    name: "Red Carnations",
    description: "Classic red carnations for love and admiration. Long-lasting and versatile for any occasion.",
    price: 13,
    category: "Carnations",
    subcategory: "Classic Collection",
    color: "Red",
    image: "/images/products/redcarnations.jpg",
    gallery: [
      "/images/products/redcarnations.jpg"
    ],
    inStock: true,
    stockQuantity: 300,
    featured: true,
    rating: 4.6,
    reviews: 84,
    origin: "Kenya",
    seasonality: "Year-round",
    vaseLife: "10-14 days",
    care: "Change water every 2-3 days",
    tags: ["classic", "red", "love", "traditional", "affordable"]
  },
  {
    id: 6,
    name: "Pink Carnations",
    description: "Soft pink carnations for gratitude and admiration. Perfect for Mother's Day and appreciation gifts.",
    price: 13,
    category: "Carnations",
    subcategory: "Classic Collection",
    color: "Pink",
    image: "/images/products/pinkcarnations.jpg",
    gallery: [
      "/images/products/pinkcarnations.jpg"
    ],
    inStock: true,
    stockQuantity: 250,
    featured: false,
    rating: 4.5,
    reviews: 63,
    origin: "Kenya",
    seasonality: "Year-round",
    vaseLife: "10-14 days",
    care: "Change water every 2-3 days",
    tags: ["pink", "gratitude", "mothers-day", "appreciation", "affordable"]
  },
  {
    id: 7,
    name: "White Carnations",
    description: "Pure white carnations for innocence and pure love. Ideal for weddings and sympathy arrangements.",
    price: 13,
    category: "Carnations",
    subcategory: "Classic Collection",
    color: "White",
    image: "/images/products/whitecarnations.jpg",
    gallery: [
      "/images/products/whitecarnations.jpg"
    ],
    inStock: true,
    stockQuantity: 200,
    featured: false,
    rating: 4.7,
    reviews: 71,
    origin: "Kenya",
    seasonality: "Year-round",
    vaseLife: "10-14 days",
    care: "Change water every 2-3 days",
    tags: ["white", "pure", "wedding", "sympathy", "innocent"]
  },
  {
    id: 8,
    name: "Mixed Snapdragons",
    description: "Vibrant snapdragons in assorted colors. Adds playful, vertical interest to garden-style arrangements.",
    price: 78,
    category: "Snapdragons",
    subcategory: "Garden Collection",
    color: "Mixed",
    image: "/images/products/mixedsnapdragons.jpg",
    gallery: [
      "/images/products/mixedsnapdragons.jpg"
    ],
    inStock: true,
    stockQuantity: 180,
    featured: true,
    rating: 4.6,
    reviews: 41,
    origin: "Kenya",
    seasonality: "Cool season",
    vaseLife: "7-10 days",
    care: "Keep stems in water, remove spent blooms",
    tags: ["colorful", "vertical", "cottage-garden", "playful", "mixed"]
  },
  {
    id: 9,
    name: "Pink Snapdragons",
    description: "Delicate pink snapdragons for romantic, whimsical bouquets. A cottage garden favorite.",
    price: 78,
    category: "Snapdragons",
    subcategory: "Garden Collection",
    color: "Pink",
    image: "/images/products/pinksnapdragons.webp",
    gallery: [
      "/images/products/pinksnapdragons.webp"
    ],
    inStock: true,
    stockQuantity: 140,
    featured: false,
    rating: 4.5,
    reviews: 28,
    origin: "Kenya",
    seasonality: "Cool season",
    vaseLife: "7-10 days",
    care: "Keep stems in water, remove spent blooms",
    tags: ["pink", "romantic", "cottage-garden", "whimsical", "delicate"]
  },
  {
    id: 10,
    name: "Red Roses",
    description: "Premium Kenyan red roses, the ultimate symbol of love and passion. Hand-selected for their perfect form and rich color.",
    price: 104,
    category: "Roses",
    subcategory: "Signature Collection",
    color: "Red",
    image: "/images/products/redroses.jpg",
    gallery: [
      "/images/products/redroses.jpg"
    ],
    inStock: true,
    stockQuantity: 400,
    featured: true,
    rating: 5.0,
    reviews: 156,
    origin: "Kenya Highlands",
    seasonality: "Year-round",
    vaseLife: "7-12 days",
    care: "Trim stems underwater, change water daily",
    tags: ["red", "love", "passion", "premium", "romantic"]
  },
  {
    id: 11,
    name: "White Roses",
    description: "Elegant white roses for purity and new beginnings. Perfect for weddings and special celebrations.",
    price: 104,
    category: "Roses",
    subcategory: "Signature Collection",
    color: "White",
    image: "/images/products/whiteroses.jpg",
    gallery: [
      "/images/products/whiteroses.jpg"
    ],
    inStock: true,
    stockQuantity: 350,
    featured: true,
    rating: 4.9,
    reviews: 98,
    origin: "Kenya Highlands",
    seasonality: "Year-round",
    vaseLife: "7-12 days",
    care: "Trim stems underwater, change water daily",
    tags: ["white", "pure", "wedding", "celebration", "elegant"]
  },
  {
    id: 12,
    name: "Pink Roses",
    description: "Soft pink roses for grace and gratitude. Perfect for expressing appreciation and gentle love.",
    price: 104,
    category: "Roses",
    subcategory: "Signature Collection",
    color: "Pink",
    image: "/images/products/pinkroses.jpg",
    gallery: [
      "/images/products/pinkroses.jpg"
    ],
    inStock: true,
    stockQuantity: 280,
    featured: true,
    rating: 4.8,
    reviews: 74,
    origin: "Kenya Highlands",
    seasonality: "Year-round",
    vaseLife: "7-12 days",
    care: "Trim stems underwater, change water daily",
    tags: ["pink", "grace", "gratitude", "appreciation", "gentle"]
  },
  {
    id: 13,
    name: "Yellow Roses",
    description: "Bright yellow roses for friendship and joy. Brings warmth and happiness to any occasion.",
    price: 104,
    category: "Roses",
    subcategory: "Signature Collection",
    color: "Yellow",
    image: "/images/products/yellowroses.jpg",
    gallery: [
      "/images/products/yellowroses.jpg"
    ],
    inStock: true,
    stockQuantity: 220,
    featured: false,
    rating: 4.7,
    reviews: 51,
    origin: "Kenya Highlands",
    seasonality: "Year-round",
    vaseLife: "7-12 days",
    care: "Trim stems underwater, change water daily",
    tags: ["yellow", "friendship", "joy", "cheerful", "warmth"]
  },
  {
    id: 14,
    name: "Variegated Hydrangeas",
    description: "Variegated hydrangeas with multi-colored petals and a beautiful ombre effect. Dramatic and premium statement blooms.",
    price: 162,
    category: "Hydrangeas",
    subcategory: "Premium Collection",
    color: "Variegated",
    image: "/images/products/varigatedhydrengeas.jpg",
    gallery: [
      "/images/products/varigatedhydrengeas.jpg"
    ],
    inStock: true,
    stockQuantity: 60,
    featured: true,
    rating: 4.9,
    reviews: 32,
    origin: "Netherlands",
    seasonality: "Summer peak",
    vaseLife: "5-8 days",
    care: "Keep in cool water, mist petals daily",
    tags: ["variegated", "premium", "statement", "dramatic", "ombre"]
  },
  {
    id: 15,
    name: "White Hydrangeas",
    description: "Classic white hydrangeas with lush, full blooms. Perfect for luxury and wedding arrangements.",
    price: 162,
    category: "Hydrangeas",
    subcategory: "Premium Collection",
    color: "White",
    image: "/images/products/whitehydrengeas.jpg",
    gallery: [
      "/images/products/whitehydrengeas.jpg"
    ],
    inStock: true,
    stockQuantity: 45,
    featured: true,
    rating: 5.0,
    reviews: 21,
    origin: "Netherlands",
    seasonality: "Summer peak",
    vaseLife: "5-8 days",
    care: "Keep in cool water, mist petals daily",
    tags: ["white", "luxury", "premium", "wedding", "classic"]
  },
  {
    id: 16,
    name: "Red Hydrangeas",
    description: "Romantic red hydrangeas with rich color gradations. Ideal for elegant and dramatic occasions.",
    price: 162,
    category: "Hydrangeas",
    subcategory: "Premium Collection",
    color: "Red",
    image: "/images/products/redhydrengeas.jpg",
    gallery: [
      "/images/products/redhydrengeas.jpg"
    ],
    inStock: true,
    stockQuantity: 50,
    featured: false,
    rating: 4.8,
    reviews: 18,
    origin: "Netherlands",
    seasonality: "Summer peak",
    vaseLife: "5-8 days",
    care: "Keep in cool water, mist petals daily",
    tags: ["red", "romantic", "elegant", "dramatic", "premium"]
  }
];

// --- Helper: Get or create category by name ---
async function getOrCreateCategory(name) {
  let category = await prisma.category.findFirst({ where: { name } });
  if (!category) {
    category = await prisma.category.create({ data: { name } });
  }
  return category;
}

// --- Seed flower products ---
async function seedFlowerProducts() {
  console.log('Seeding flower products...');
  for (const prod of flowerProducts) {
    const priceKES = prod.price;
    const category = await getOrCreateCategory(prod.category);
    const attributes = {
      gallery: prod.gallery,
      featured: prod.featured,
      rating: prod.rating,
      reviews: prod.reviews,
      origin: prod.origin,
      seasonality: prod.seasonality,
      vaseLife: prod.vaseLife,
      care: prod.care,
      tags: prod.tags,
      inStock: prod.inStock
    };
    // Use findFirst + update/create instead of upsert
    const existing = await prisma.product.findFirst({ where: { name: prod.name } });
    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          price: priceKES,
          description: prod.description,
          imageUrl: prod.image,
          stock: prod.stockQuantity,
          categoryId: category.id,
          subcategory: prod.subcategory || null,
          color: prod.color || null,
          attributes
        }
      });
    } else {
      await prisma.product.create({
        data: {
          name: prod.name,
          price: priceKES,
          description: prod.description,
          imageUrl: prod.image,
          stock: prod.stockQuantity,
          categoryId: category.id,
          subcategory: prod.subcategory || null,
          color: prod.color || null,
          attributes
        }
      });
    }
  }
  console.log(`Seeded ${flowerProducts.length} flower products successfully!`);
}

async function main() {
  console.log('Starting database seed...');

  // Create or update an admin user
  const adminPassword = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'admin',
    },
  });
  console.log('Admin user created/updated');

  // Create or update a customer user
  const customerPassword = await bcrypt.hash('password123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: customerPassword,
      name: 'Customer User',
      role: 'customer',
    },
  });
  console.log('Customer user created/updated');

  // Seed all flower products (this will create categories automatically)
  await seedFlowerProducts();

  // Create or update a promotion
  const promotion = await prisma.promotion.upsert({
    where: { code: 'SAVE10' },
    update: {},
    create: {
      code: 'SAVE10',
      discount: 10.0,
      expiryDate: new Date('2025-12-31T23:59:59.000Z'),
    },
  });
  console.log('Promotion created/updated');

  // Get a sample product for creating sample order
  const sampleProduct = await prisma.product.findFirst({
    where: { name: 'Red Roses' }
  });

  if (sampleProduct) {
    // Create or update a sample order for the customer
    let order = await prisma.order.findFirst({ where: { orderNumber: 'KF000001' } });
    if (order) {
      order = await prisma.order.update({
        where: { id: order.id },
        data: {
          userId: customer.id,
          total: 208.00, // 2 x Red Roses at 104 KES each
          status: 'Pending',
          deliveryFee: 0,
          shippingAddress: {
            name: 'Customer User',
            phone: '+254700000000',
            email: 'customer@example.com',
            street: '123 Main St',
            city: 'Nairobi',
            county: 'Nairobi',
            zip: '00100',
            specialInstructions: 'Leave at the front desk',
            preferredDeliveryTime: 'morning',
          },
        },
      });
    } else {
      order = await prisma.order.create({
        data: {
          userId: customer.id,
          total: 208.00, // 2 x Red Roses at 104 KES each
          status: 'Pending',
          orderNumber: 'KF000001',
          deliveryFee: 0,
          shippingAddress: {
            name: 'Customer User',
            phone: '+254700000000',
            email: 'customer@example.com',
            street: '123 Main St',
            city: 'Nairobi',
            county: 'Nairobi',
            zip: '00100',
            specialInstructions: 'Leave at the front desk',
            preferredDeliveryTime: 'morning',
          },
        },
      });
    }

    // Create or update an order item linked to the order and product
    await prisma.orderItem.upsert({
      where: { id: 1 },
      update: {},
      create: {
        orderId: order.id,
        productId: sampleProduct.id,
        quantity: 2,
        price: 104.00,
      },
    });

    // Create or update a review for the product
    await prisma.review.upsert({
      where: { id: 1 },
      update: {},
      create: {
        userId: customer.id,
        productId: sampleProduct.id,
        rating: 5,
        comment: 'Beautiful premium roses! Excellent quality and long-lasting.',
      },
    });
    
    console.log('Sample order and review created/updated');
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });