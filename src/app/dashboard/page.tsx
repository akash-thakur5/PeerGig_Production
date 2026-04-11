"use client";

import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import TopNavBar from '@/components/TopNavBar';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Added dynamic wallet fetch so dashboard shows real data
export default function DashboardPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("Student");

  useEffect(() => {
    // Fetch user info for greeting
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user && data.user.name) {
          setUserName(data.user.name.split(' ')[0]);
        }
      })
      .catch(console.error);

    // Fetch wallet balance
    fetch('/api/wallet')
      .then(res => res.json())
      .then(data => {
        if (data.balance !== undefined) {
          setBalance(data.balance);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body flex flex-col pt-16 md:pt-0">
      {/* TopNavBar */}
      <TopNavBar />

      {/* SideNavBar */}
      <Sidebar />

      {/* Main Content Canvas */}
      <main className="md:ml-64 pt-24 pb-12 px-8 flex-1 bg-surface">
        <div className="max-w-7xl mx-auto">
          {/* Hero Greeting */}
          <section className="mb-12">
            <h1 className="text-[3.5rem] font-headline font-extrabold text-on-surface tracking-tighter leading-tight">
              Welcome back, <span className="text-primary">{userName}!</span>
            </h1>
            <p className="text-secondary text-lg font-body max-w-2xl mt-2">
              Your academic atelier is ready. You have 3 pending reviews and an upcoming session in 2 hours.
            </p>
          </section>

          {/* Quick Stats Row (Bento Style) */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {/* Card 1: Sessions */}
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_40px_80px_-20px_rgba(27,27,30,0.04)] hover:-translate-y-1 transition-transform duration-300 group cursor-default">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-primary/5 rounded-full text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">calendar_today</span>
                </div>
                <span className="text-[0.6875rem] font-label font-bold uppercase tracking-widest text-secondary">Upcoming</span>
              </div>
              <h3 className="text-secondary font-label font-medium mb-1">Upcoming Sessions</h3>
              <p className="text-xl font-headline font-bold text-on-surface">Physics II Tutoring at 4:00 PM</p>
            </div>

            {/* Card 2: Wallet */}
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_40px_80px_-20px_rgba(27,27,30,0.04)] hover:-translate-y-1 transition-transform duration-300 group cursor-default">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-primary/5 rounded-full text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                </div>
                <span className="text-[0.6875rem] font-label font-bold uppercase tracking-widest text-secondary">Verified</span>
              </div>
              <h3 className="text-secondary font-label font-medium mb-1">Wallet Balance</h3>
              <p className="text-[2rem] font-headline font-extrabold text-on-surface tracking-tight">
                {balance !== null ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(balance) : '₹...'}
              </p>
            </div>

            {/* Card 3: Gigs */}
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_40px_80px_-20px_rgba(27,27,30,0.04)] hover:-translate-y-1 transition-transform duration-300 group cursor-default">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-primary/5 rounded-full text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <span className="text-[0.6875rem] font-label font-bold uppercase tracking-widest text-secondary">Active</span>
              </div>
              <h3 className="text-secondary font-label font-medium mb-1">Active Gigs</h3>
              <p className="text-xl font-headline font-bold text-on-surface">4 Topics currently teaching</p>
            </div>
          </section>

          {/* Recommended Topics (Editorial Layout) */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-headline font-bold text-on-surface">Recommended Topics for You</h2>
              <Link className="text-primary font-bold text-sm hover:underline" href="/topics">View All Topics</Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Recommended Card A */}
              <div className="bg-surface-container-low rounded-xl overflow-hidden group border border-outline-variant/10 cursor-pointer">
                <div className="h-48 overflow-hidden relative">
                  <Image 
                    alt="Code representation" 
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxuPENXxB57nJ-61L4AyUl0aDSOm43iVMolNNzfEhXor-YjFvapioQGkjV1t5KLT5Axy-jZKIDwEc4tcBDY9gK_LEu-JVhJqJEqO7AY9Re9xo0FkzyNjgnH9gTw3oqzHEFC70myuCBxJO99U8WM16G0cNOkiUDdCDdTl-PQBo4WSm-U1uwmqvYhCGU915wOeary472jZp-IJfdnjy37-hTdEHeqjPHQHWXxlnxf1fUp73ny33ZTjiBpk0xuhg3OUewGc5Bb4bgaW8" 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-4 right-4 bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-bold text-sm shadow-lg text-white">
                    ₹500.00
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-headline font-bold mb-4">Recursive Functions</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-label text-secondary uppercase tracking-tighter">CS • 45 MINS</span>
                    <span className="inline-flex items-center gap-1 text-primary font-bold hover:gap-2 transition-all">
                      View link <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommended Card B */}
              <div className="bg-surface-container-low rounded-xl overflow-hidden group border border-outline-variant/10 cursor-pointer">
                <div className="h-48 overflow-hidden relative">
                  <Image 
                    alt="Economics charts" 
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDY_vUtLakFrHszl8m3AocRfWCO27Hz9h4nKS51H4jM4Bm9Y2n2o8L0k5ckgDxNCiRAR6BVenySLeaNqnYZDYxnQsS3rMoKmcVpYkzpRJiBcDh-sS59poFVNzm2B6h2uEVWRYlgpATP9z8Ifer2KivmPpAQ8S2ydN-23zb9AHKwdqpKVFsCsGRHp_8t1k1wRbaAq-WAgC64-XA4TBNoMMAGUysu3yQmm3OOrR8iyXtqrVa5vYxht51DKF42YjNdFm-TOeOjd-_wSqM" 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-4 right-4 bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-bold text-sm shadow-lg text-white">
                    ₹350.00
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-headline font-bold mb-4">Microeconomics 101</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-label text-secondary uppercase tracking-tighter">ECON • 30 MINS</span>
                    <span className="inline-flex items-center gap-1 text-primary font-bold hover:gap-2 transition-all">
                      View link <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommended Card C */}
              <div className="bg-surface-container-low rounded-xl overflow-hidden group border border-outline-variant/10 cursor-pointer">
                <div className="h-48 overflow-hidden relative">
                  <Image 
                    alt="Neural mapping" 
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCINIaAhNDQaXmpnZidCi7mD8TcQOj300uVhcIIem1GVJtqxvSYxT90fuXKLO5A6DaChEnF5rS1O7QwLfNdu2wb3_E7-wpcqCyT3rJpnY07InQ309JDLoxMnkkxC2v6GcMI2Ox2QaSM1yTQegtHo7SskhSYrMQ_-9AtiXv-alyRXY430Omw6ScrF_Cm2-il0kb1Eb2utIRAWIGjKphExBrWgjbM6T3KJjENw5lUrIlAafFlYdhQKJrRgibH8TqhRdIvqsnuZWdSZuA" 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-4 right-4 bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-bold text-sm shadow-lg text-white">
                    ₹725.00
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-headline font-bold mb-4">Neural Synapse Mapping</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-label text-secondary uppercase tracking-tighter">BIO • 60 MINS</span>
                    <span className="inline-flex items-center gap-1 text-primary font-bold hover:gap-2 transition-all">
                      View link <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-[#f6f2f7] bg-[#fbf8fc] md:pl-64 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto w-full">
          <div className="mb-6 md:mb-0">
            <div className="text-xl font-black text-[#1b1b1e] font-headline mb-2">PeerGig</div>
            <p className="font-body text-sm text-[#5f5e61] tracking-wide">© 2024 PeerGig. The Digital Atelier for Academic Growth.</p>
          </div>
          <div className="flex gap-8">
            <Link className="text-sm font-body text-[#5f5e61] hover:text-[#904d00] transition-colors" href="/terms">Terms of Service</Link>
            <Link className="text-sm font-body text-[#5f5e61] hover:text-[#904d00] transition-colors" href="/privacy">Privacy Policy</Link>
            <Link className="text-sm font-body text-[#5f5e61] hover:text-[#904d00] transition-colors" href="/support">Support</Link>
          </div>
        </div>
      </footer>

      {/* BottomNavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-surface-container flex justify-around items-center py-3 z-50">
        <Link className="flex flex-col items-center text-primary" href="/dashboard">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <Link className="flex flex-col items-center text-secondary" href="/skillswap">
          <span className="material-symbols-outlined">swap_horiz</span>
          <span className="text-[10px]">Swap</span>
        </Link>
        <Link className="flex flex-col items-center text-secondary" href="/tutor">
          <span className="material-symbols-outlined">school</span>
          <span className="text-[10px]">Tutor</span>
        </Link>
        <Link className="flex flex-col items-center text-secondary" href="/messages">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
          <span className="text-[10px]">Chat</span>
        </Link>
      </nav>
    </div>
  );
}
