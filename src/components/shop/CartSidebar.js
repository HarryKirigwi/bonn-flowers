'use client';
import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartSidebar({ isOpen, onClose }) {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, getCartItemCount } = useCart();

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`absolute right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <Link href="/products" onClick={onClose} className="btn-primary">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  <Image
                    src={item.image || `https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=100&h=100&fit=crop`}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{item.name}</h4>
                    <p className="text-pink-600 font-bold mb-2">${item.price}</p>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 p-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t p-6 space-y-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total ({getCartItemCount()} items):</span>
              <span className="text-pink-600">${getCartTotal().toFixed(2)}</span>
            </div>
            
            <div className="space-y-2">
              <Link
                href="/cart"
                onClick={onClose}
                className="block w-full text-center py-3 border-2 border-pink-500 text-pink-500 rounded-xl font-semibold hover:bg-pink-500 hover:text-white transition-colors"
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                className="block w-full text-center btn-primary"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
