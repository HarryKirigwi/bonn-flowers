/**
 * API functions for product-related operations
 */

/**
 * Fetches featured products from the API
 * @returns {Promise<Array>} Array of featured product objects
 */
export async function getFeaturedProducts() {
  // In a real application, this would make an API call to the backend
  // For now, we'll return mock data
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [
    {
      id: 1,
      name: "White Delphiniums",
      description: "Elegant tall white flower spikes perfect for wedding arrangements and formal bouquets. These premium delphiniums add height and sophistication to any floral design.",
      price: 32,
      category: "Delphiniums",
      subcategory: "Premium Stems",
      color: "White",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&h=800&fit=crop"
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
      description: "Stunning deep blue flower spikes that create dramatic focal points. Perfect for adding a pop of color to arrangements and garden-style bouquets.",
      price: 32,
      category: "Delphiniums",
      subcategory: "Premium Stems",
      color: "Blue",
      image: "https://images.unsplash.com/photo-1597848212624-e4c2d5afd974?w=800&h=800&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1597848212624-e4c2d5afd974?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&h=800&fit=crop"
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
      description: "Delicate pale blue flower spikes with a soft, romantic appeal. Ideal for pastel arrangements and baby shower decorations.",
      price: 32,
      category: "Delphiniums",
      subcategory: "Premium Stems",
      color: "Baby Blue",
      image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&h=800&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop"
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
  
    // Proteas - $0.40 per stem
    {
      id: 4,
      name: "Proteas Safari Sunset",
      description: "Exotic South African proteas with stunning sunset colors. These unique flowers add a touch of the wild to any arrangement with their distinctive appearance.",
      price: 52,
      category: "Proteas",
      subcategory: "Exotic Flowers",
      color: "Sunset Orange",
      image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=800&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1542328741-1b2fb5fbd922?w=800&h=800&fit=crop"
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
  
    // Carnations - $0.10 per stem
    {
      id: 5,
      name: "Red Carnations",
      description: "Classic red carnations perfect for expressing love and admiration. These traditional flowers are versatile and long-lasting.",
      price: 13,
      category: "Carnations",
      subcategory: "Classic Collection",
      color: "Red",
      image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&h=800&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&h=800&fit=crop"
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
      description: "Soft pink carnations symbolizing gratitude and admiration. Perfect for Mother's Day and appreciation bouquets.",
      price: 13,
      category: "Carnations",
      subcategory: "Classic Collection",
      color: "Pink",
      image: "https://images.unsplash.com/photo-1551925249-4acb3a2a8d52?w=800&h=800&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1551925249-4acb3a2a8d52?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&h=800&fit=crop"
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
      description: "Pure white carnations representing innocence and pure love. Ideal for weddings and sympathy arrangements.",
      price: 13,
      category: "Carnations",
      subcategory: "Classic Collection",
      color: "White",
      image: "https://images.unsplash.com/photo-1595351571945-1e64d6ad7f3f?w=800&h=800&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1595351571945-1e64d6ad7f3f?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&h=800&fit=crop"
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
      name: "Yellow Carnations",
      description: "Cheerful yellow carnations bringing sunshine to any arrangement. Perfect for friendship bouquets and brightening someone's day.",
      price: 13,
      category: "Carnations",
      subcategory: "Classic Collection",
      color: "Yellow",
      image: "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=800&h=800&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&h=800&fit=crop"
      ],
      inStock: true,
      stockQuantity: 180,
      featured: false,
      rating: 4.4,
      reviews: 41,
      origin: "Kenya",
      seasonality: "Year-round",
      vaseLife: "10-14 days",
      care: "Change water every 2-3 days",
      tags: ["yellow", "cheerful", "friendship", "sunny", "affordable"]
    },
    {
      id: 9,
      name: "Purple Carnations",
      description: "Rich purple carnations with deep, royal hues. These striking flowers add elegance and mystery to any floral arrangement.",
      price: 13,
      category: "Carnations",
      subcategory: "Classic Collection",
      color: "Purple",
      image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&h=800&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&h=800&fit=crop"
      ],
      inStock: true,
      stockQuantity: 160,
      featured: false,
      rating: 4.6,
      reviews: 37,
      origin: "Kenya",
      seasonality: "Year-round",
      vaseLife: "10-14 days",
      care: "Change water every 2-3 days",
      tags: ["purple", "royal", "elegant", "mysterious", "affordable"]
    },
  
    // Snap Dragons - $0.60 per stem
    {
      id: 10,
      name: "Mixed Snap Dragons",
      description: "Vibrant snap dragons in assorted colors. These playful flowers add vertical interest and cottage garden charm to arrangements.",
      price: 78,
      category: "Snap Dragons",
      subcategory: "Garden Collection",
      color: "Mixed",
      image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&h=800&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1597848212624-e4c2d5afd974?w=800&h=800&fit=crop"
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
      id: 11,
      name: "Pink Snap Dragons",
      description: "Delicate pink snap dragons with soft, romantic appeal. These cottage garden favorites bring whimsical charm to bouquets.",
      price: 78,
      category: "Snap Dragons",
      subcategory: "Garden Collection",
      color: "Pink",
      image: "https://images.unsplash.com/photo-1551925249-4acb3a2a8d52?w=800&h=800&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1551925249-4acb3a2a8d52?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&h=800&fit=crop"
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
  
    // Roses - $0.80 per stem
    {
      id: 12,
      name: "Red Roses",
      description: "Premium Kenyan red roses, the ultimate symbol of love and passion. Hand-selected for their perfect form and rich color.",
      price: 104,
      category: "Roses",
      subcategory: "Signature Collection",
      color: "Red",
      image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&h=800&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&h=800&fit=crop"
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
      id: 13,
      name: "White Roses",
      description: "Elegant white roses representing purity and new beginnings. Perfect for weddings and special celebrations.",
      price: 104,
      category: "Roses",
      subcategory: "Signature Collection",
      color: "White",
      image: "https://images.unsplash.com/photo-1595351571945-1e64d6ad7f3f?w=800&h=800&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1595351571945-1e64d6ad7f3f?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&h=800&fit=crop"
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
      id: 14,
      name: "Pink Roses",
      description: "Soft pink roses conveying grace and gratitude. These beautiful blooms are perfect for expressing appreciation and gentle love.",
      price: 104,
      category: "Roses",
      subcategory: "Signature Collection",
      color: "Pink",
      image: "https://images.unsplash.com/photo-1551925249-4acb3a2a8d52?w=800&h=800&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1551925249-4acb3a2a8d52?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&h=800&fit=crop"
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
      id: 15,
      name: "Yellow Roses",
      description: "Bright yellow roses symbolizing friendship and joy. These cheerful blooms bring warmth and happiness to any occasion.",
      price: 104,
      category: "Roses",
      subcategory: "Signature Collection",
      color: "Yellow",
      image: "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=800&h=800&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&h=800&fit=crop"
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
  
    // Variegated Hydrangeas - $1.25 per stem
    {
      id: 16,
      name: "Variegated Hydrangeas",
      description: "Stunning variegated hydrangeas with multi-colored petals creating a beautiful ombre effect. These premium blooms make dramatic statement pieces.",
      price: 162,
      category: "Hydrangeas",
      subcategory: "Premium Collection",
      color: "Variegated",
      image: "https://images.unsplash.com/photo-1597848212624-e4c2d5afd974?w=800&h=800&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1597848212624-e4c2d5afd974?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&h=800&fit=crop"
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
      id: 17,
      name: "Blue Variegated Hydrangeas",
      description: "Exquisite blue variegated hydrangeas with stunning color transitions from deep blue to lighter hues. Perfect for luxury arrangements.",
      price: 162,
      category: "Hydrangeas",
      subcategory: "Premium Collection",
      color: "Blue Variegated",
      image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&h=800&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1597848212624-e4c2d5afd974?w=800&h=800&fit=crop"
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
      tags: ["blue", "variegated", "luxury", "premium", "gradient"]
    },
    {
      id: 18,
      name: "Pink Variegated Hydrangeas",
      description: "Romantic pink variegated hydrangeas featuring beautiful color gradations from soft pink to deeper rose tones. Ideal for elegant occasions.",
      price: 162,
      category: "Hydrangeas",
      subcategory: "Premium Collection",
      color: "Pink Variegated",
      image: "https://images.unsplash.com/photo-1551925249-4acb3a2a8d52?w=800&h=800&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1551925249-4acb3a2a8d52?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1597848212624-e4c2d5afd974?w=800&h=800&fit=crop"
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
      tags: ["pink", "variegated", "romantic", "elegant", "gradient"]
    }
  ];
}

/**
 * Fetches a single product by ID
 * @param {string} id - The product ID
 * @returns {Promise<Object>} Product object
 */
export async function getProductById(id) {
  // In a real application, this would make an API call to the backend
  // For now, we'll return mock data based on the ID
  
  const products = await getFeaturedProducts();
  return products.find(product => product.id === id) || null;
}

/**
 * Fetches products by category
 * @param {string} category - The category name
 * @returns {Promise<Array>} Array of product objects in the category
 */
export async function getProductsByCategory(category) {
  // In a real application, this would make an API call to the backend
  // For now, we'll filter the mock data
  
  const products = await getFeaturedProducts();
  return products.filter(product => product.category === category);
}

// This file is no longer needed. All product fetching is now handled via the /api/products endpoint.