'use client';

import { useState } from 'react';
import { useNotification } from '@/context/NotificationContext';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showError('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // This would be replaced with an actual API call
      // const response = await fetch('/api/newsletter/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccess('Thank you for subscribing to our newsletter!');
      setEmail('');
    } catch (error) {
      showError('Failed to subscribe. Please try again.');
      console.error('Newsletter subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-pink-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-gray-600 mb-8">
            Stay updated with our latest flower collections, seasonal offers, and flower care tips.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-pink-600 hover:bg-pink-700 text-white font-medium px-6 py-3 rounded-full transition-colors disabled:opacity-70"
            >
              {isLoading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          
          <p className="text-sm text-gray-500 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}