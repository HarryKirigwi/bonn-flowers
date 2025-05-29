'use client'
import { AuthContextProvider } from '@/context/AuthContext';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  return (
    <AuthContextProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </AuthContextProvider>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  // ...existing login form logic goes here...
  return (
    <div>
      {/* Your login form UI, using searchParams as needed */}
      Login form goes here
    </div>
  );
}