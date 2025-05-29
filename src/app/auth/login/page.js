'use client'
import { AuthContextProvider } from '@/context/AuthContext';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR issues with useSearchParams
const LoginPage = dynamic(() => import('./LoginPage'), {
  ssr: false
});

export default function LoginPageWrapper() {
  return (
    <AuthContextProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginPage />
      </Suspense>
    </AuthContextProvider>
  );
}