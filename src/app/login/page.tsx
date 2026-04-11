"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { DIcons } from 'dicons';
import { useState, Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Login failed');
        return;
      }

      // All users are students — redirect to dashboard
      if (redirect !== '/dashboard') {
        router.push(redirect);
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type: 'student1' | 'student2') => {
    if (type === 'student1') {
      setEmail('student1@peergig.com');
      setPassword('student123');
    } else {
      setEmail('student2@peergig.com');
      setPassword('student456');
    }
  };

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
        
        {/* Demo Credentials Box */}
        <div className="relative z-10 border-t border-outline-variant/20 pt-8 space-y-4">
          <p className="font-label text-xs uppercase tracking-widest text-secondary mb-4">Demo Credentials</p>
          <div className="flex gap-3">
            <button
              onClick={() => fillDemo('student1')}
              className="flex-1 py-3 px-4 rounded-xl bg-primary/10 border border-primary/20 text-primary font-semibold text-sm hover:bg-primary/20 transition-all text-left"
            >
              <p className="font-bold text-xs uppercase tracking-wider mb-1">Student 1</p>
              <p className="text-xs opacity-80">Arjun Mehta</p>
              <p className="text-xs opacity-60">student1@peergig.com · student123</p>
            </button>
            <button
              onClick={() => fillDemo('student2')}
              className="flex-1 py-3 px-4 rounded-xl bg-primary/10 border border-primary/20 text-primary font-semibold text-sm hover:bg-primary/20 transition-all text-left"
            >
              <p className="font-bold text-xs uppercase tracking-wider mb-1">Student 2</p>
              <p className="text-xs opacity-80">Priya Sharma</p>
              <p className="text-xs opacity-60">student2@peergig.com · student456</p>
            </button>
          </div>
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

          {/* Mobile Demo Buttons */}
          <div className="md:hidden flex gap-2">
            <button onClick={() => fillDemo('student1')} className="flex-1 py-2 px-3 rounded-lg bg-primary/10 text-primary text-xs font-bold border border-primary/20">
              Student 1 (Arjun)
            </button>
            <button onClick={() => fillDemo('student2')} className="flex-1 py-2 px-3 rounded-lg bg-primary/10 text-primary text-xs font-bold border border-primary/20">
              Student 2 (Priya)
            </button>
          </div>
          
          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}
          
          {/* Credentials Form */}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Email Address</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-secondary/60 group-focus-within:text-primary transition-colors">mail</span>
                <input
                  id="email"
                  className="w-full pl-8 py-3 bg-transparent border-b border-outline-variant/50 focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-secondary/40 outline-none"
                  placeholder="tutor@peergig.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-secondary/60 group-focus-within:text-primary transition-colors">lock</span>
                <input
                  id="password"
                  className="w-full pl-8 pr-8 py-3 bg-transparent border-b border-outline-variant/50 focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-secondary/40 outline-none"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button className="absolute right-0 top-1/2 -translate-y-1/2 text-secondary/40 hover:text-on-surface" type="button" onClick={() => setShowPassword(!showPassword)}>
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            
            {/* Primary Action */}
            <div className="pt-4">
              <button
                className="w-full py-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold text-lg shadow-xl shadow-primary-container/20 hover:scale-[1.02] active:scale-95 transition-all duration-150 disabled:opacity-60 disabled:scale-100"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>
          
          {/* Footer Text */}
          <p className="text-center text-sm text-secondary">
            Demo app — use the credential cards on the left to log in instantly.
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
