'use client';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, getCartItemCount } = useCart();

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-pink-50 py-12 px-2 sm:px-0">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-10">
        <h1 className="text-3xl font-bold mb-8 text-pink-600 text-center">Your Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <Link href="/shop/available-products" className="btn-primary">Continue Shopping</Link>
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-8">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 items-center bg-gray-50 rounded-xl p-4">
                  <Image
                    src={item.imageUrl && item.imageUrl.trim() !== '' ? item.imageUrl : '/images/products/placeholder.jpg'}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                    unoptimized={false}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-lg mb-1 truncate">{item.name}</h4>
                    <p className="text-pink-600 font-bold mb-2">kes {item.price}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        aria-label="Decrease quantity"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 p-1 transition-colors"
                    aria-label="Remove from cart"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-lg font-semibold">
                Total ({getCartItemCount()} items):
                <span className="text-pink-600 ml-2 text-2xl font-bold">Kes {getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <Link href="/shop/available-products" className="btn-secondary w-full sm:w-auto text-center">Continue Shopping</Link>
                <Link href="/shop/checkout" className="btn-primary w-full sm:w-auto text-center">Proceed to Checkout</Link>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}