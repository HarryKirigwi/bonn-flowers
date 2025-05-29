'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// import { getCategories } from '@/lib/api/categories';

export default function CategoryGrid() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data.slice(0, 6)); // Show only 6 categories
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
              Shop by Category
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="relative h-64 bg-gray-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Find the perfect flowers for every occasion and emotion
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="group relative h-64 rounded-3xl overflow-hidden card-shadow"
            >
              <Image
                src={category.image || `https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&h=400&fit=crop`}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                <p className="text-white/80 text-sm">
                  {category.description || `Beautiful ${category.name.toLowerCase()} flowers`}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/categories" className="btn-secondary">
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
}