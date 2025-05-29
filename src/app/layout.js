import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { NotificationProvider } from '@/context/NotificationContext';
import LayoutWrapper from '@/components/layout/LayoutWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'House of Bonn',
  description: 'Beautiful flowers for every occasion. Fresh, premium quality flowers delivered to your door.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/icons/bonnflowers.svg" type="image/svg+xml" />
      </head>
      <body className={inter.className}>
        <NotificationProvider>
          <CartProvider>
            <AuthProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </AuthProvider>
          </CartProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
