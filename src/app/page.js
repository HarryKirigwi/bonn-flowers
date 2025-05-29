"use client"
import { useEffect } from 'react';
import Hero from '@/components/shop/Hero';
import FeaturedProducts from '@/components/shop/FeaturedProducts';
import CategoryGrid from '@/components/shop/CategoryGrid';
import Testimonials from '@/components/shop/Testimonials';
import ContactPage from './contact/page';

export default function HomePage() {
  useEffect(() => {
    // Enforce smooth scroll on mount (for browsers that ignore CSS)
    if (typeof window !== 'undefined' && document.documentElement) {
      document.documentElement.style.scrollBehavior = 'smooth';
    }
  }, []);

  return (
    <main className="min-h-screen">
      <Hero />
      <FeaturedProducts />
      {/* <CategoryGrid /> */}
      <Testimonials />
      <ContactPage/>
    </main>
  );
}