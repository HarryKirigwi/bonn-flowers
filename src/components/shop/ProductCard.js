'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    try {
      await addToCart(product, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bg-white rounded-3xl overflow-hidden card-shadow group-hover:-translate-y-2 transition-all duration-300">
        <div className="relative overflow-hidden">
          <Image
            src={product.image || `https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&h=400&fit=crop`}
            alt={product.name}
            width={400}
            height={300}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Quick Actions */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              onClick={handleToggleLike}
              className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                isLiked 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-white/80 text-gray-700 hover:bg-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Stock Badge */}
          {product.stock < 10 && (
            <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Only {product.stock} left
            </div>
          )}

          {/* Rating */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-semibold">{product.rating || 4.5}</span>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-pink-600">
                ${product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isLoading || product.stock === 0}
            className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              product.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'btn-primary'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {isLoading ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}
