'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const noLayoutRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password'];

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  // Hide layout for any /auth/* route
  const hideLayout = noLayoutRoutes.some(route => pathname.startsWith(route));

  return (
    <div className="flex flex-col min-h-screen">
      {!hideLayout && <Header />}
      <main className="flex-grow">{children}</main>
      {!hideLayout && <Footer />}
    </div>
  );
}
