"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { DIcons } from 'dicons';
import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/dashboard';

  const [error, setError] = useState('');

  return (
    <main className="min-h-screen flex text-on-surface bg-surface font-body overflow-hidden">
      {/* Left Side: Editorial Content (Hidden on Mobile) */}
      <section className="hidden md:flex w-1/2 bg-surface-container-low p-16 flex-col justify-between relative overflow-hidden">
        {/* Brand Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <DIcons.Shapes className="h-6 w-6 text-primary" />
            <span className="text-2xl font-headline font-extrabold tracking-tighter text-on-surface">PeerGig</span>
          </Link>
        </div>
        
        {/* Hero Text Cluster */}
        <div className="relative z-10 max-w-xl">
          <h1 className="text-[3.5rem] font-headline font-extrabold leading-[1.1] tracking-tight text-on-surface mb-8">
            The forge for <span className="text-primary-container">decentralized</span> learning.
          </h1>
          <p className="text-xl text-secondary leading-relaxed max-w-md">
            Join thousands of students trading skills, sharing notes, and earning by teaching what they know.
          </p>
        </div>
        
        
        
        {/* Decorative Element */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary-container/5 rounded-full blur-3xl"></div>
      </section>
      
      {/* Right Side: Auth Container */}
      <section className="w-full md:w-1/2 bg-surface-container-lowest flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center gap-2 mb-2">
            <DIcons.Shapes className="h-6 w-6 text-primary" />
            <span className="text-xl font-headline font-extrabold tracking-tighter text-on-surface">PeerGig</span>
          </div>

          {/* Welcome Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-headline font-bold text-on-surface tracking-tight">Welcome Back</h2>
            <p className="text-secondary font-body">Enter your details to access your dashboard</p>
          </div>

          
          
          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}
          {/* OAuth Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-outline-variant rounded-xl text-on-surface font-semibold hover:bg-surface-container-low transition-colors shadow-sm"
              type="button"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
                <path fill="none" d="M1 1h22v22H1z" />
              </svg>
              Continue with Google
            </button>
          </div>
          
          
          
          <p className="text-center text-sm text-secondary">
            Don't have an account? <Link href="/signup" className="text-primary font-bold hover:underline">Sign up</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
