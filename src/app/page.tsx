"use client";

import Link from "next/link";
import { ChatbotLayout } from "@/components/ui/chatbot-layout";

export default function Home() {
  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary/20 overflow-x-hidden antialiased">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#fbf8fc]/80 backdrop-blur-md shadow-[0_40px_40px_-15px_rgba(27,27,30,0.04)]">
        <div className="flex justify-between items-center px-8 py-4 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-extrabold text-[#1b1b1e] tracking-tighter">
              PeerGig
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-[#904d00] font-bold border-b-2 border-[#904d00] transition-colors duration-300"
            >
              Home
            </Link>
            <Link 
              href="/search" 
              className="text-[#5f5e61] font-medium hover:text-[#904d00] transition-colors duration-300"
            >
              Browse Gigs
            </Link>
            <Link 
              href="#how-it-works" 
              className="text-[#5f5e61] font-medium hover:text-[#904d00] transition-colors duration-300"
            >
              How it Works
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <button className="px-5 py-2 text-[#5f5e61] font-medium active:scale-95 transition-transform">
                Log In
              </button>
            </Link>
            <Link href="/login">
              <button className="px-6 py-2 bg-gradient-to-br from-[#904d00] to-[#ff8c00] text-white font-bold rounded-xl active:scale-95 transition-transform shadow-lg">
                Register
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-8 max-w-[1440px] mx-auto overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary-container/10 rounded-full border border-primary-container/20">
              <span className="text-xs font-bold tracking-widest uppercase text-primary">New: Peer Notes Marketplace</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-on-surface leading-[1.1]">
              The Forge for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">Topic-Specific</span> Learning.
            </h1>
            <p className="text-lg text-secondary leading-relaxed max-w-xl">
              Don't pay for a whole course. Just pay for the topic you need. Peer-to-peer tutoring, skill-swapping, and shared notes in a student-only environment.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/login">
                <button className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-xl hover:-translate-y-0.5 transition-all">
                  Get Started
                </button>
              </Link>
              <Link href="#how-it-works">
                <button className="px-8 py-4 border-2 border-outline/20 text-primary font-bold rounded-xl hover:bg-surface-container-low transition-all">
                  How it Works
                </button>
              </Link>
            </div>
            {/* Social Proof */}
            <div className="pt-8 flex items-center space-x-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <img
                    key={i}
                    alt="Student"
                    className="w-12 h-12 rounded-full border-4 border-surface"
                    src={`https://i.pravatar.cc/150?u=student${i}`}
                  />
                ))}
                <div className="w-12 h-12 rounded-full border-4 border-surface bg-surface-container-high flex items-center justify-center text-xs font-bold text-secondary">
                  +5k
                </div>
              </div>
              <p className="text-sm text-secondary font-medium italic">
                Trusted by 5,000+ students from top universities.
              </p>
            </div>
          </div>
          {/* Asymmetric Hero Visual */}
          <div className="relative animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl opacity-60"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-tertiary-container/20 rounded-full blur-3xl opacity-60"></div>
            <div className="relative bg-surface-container-lowest p-4 rounded-[2rem] shadow-2xl rotate-2">
              <img
                alt="Student Collaboration"
                className="rounded-[1.5rem] w-full object-cover aspect-[4/3]"
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
              />
              {/* Floating UI Card */}
              <div className="absolute -bottom-6 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-outline-variant/10 max-w-[200px] -rotate-3">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="material-symbols-outlined text-primary">verified</span>
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Top Tutor</span>
                </div>
                <p className="text-sm font-semibold text-on-surface">Calculus III: Chain Rule Expert</p>
                <p className="text-primary font-bold mt-2">₹99 / session</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Key Features Bento Grid */}
      <section id="how-it-works" className="py-24 px-8 bg-surface-container-low">
        <div className="max-w-[1440px] mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl font-extrabold tracking-tight text-on-surface">Craft Your Academic Edge</h2>
            <p className="text-secondary mt-4 max-w-2xl text-lg">Hyper-focused learning tools designed specifically for the modern student's needs and budget.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-3xl flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">payments</span>
                </div>
                <h3 className="text-2xl font-bold text-on-surface">Pay-Per-Topic</h3>
                <p className="text-secondary leading-relaxed">Forget expensive courses. Micro-payments allow you to unlock specific concepts, problem sets, or exam guides for a fraction of the cost.</p>
              </div>
              <div className="mt-8 overflow-hidden rounded-xl border border-outline-variant/10">
                <img
                  alt="Micro-payments"
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
                />
              </div>
            </div>
            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-primary to-primary-container p-8 rounded-3xl text-white flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">swap_horiz</span>
                </div>
                <h3 className="text-2xl font-bold">Skill-Barter</h3>
                <p className="text-on-primary-container/80 font-medium">Trade your expertise in Python for help with Organic Chemistry. No cash needed, just knowledge exchange.</p>
              </div>
              <div className="mt-8">
                <div className="flex items-center space-x-2 bg-white/10 p-3 rounded-xl border border-white/20">
                  <span className="text-xs font-bold uppercase tracking-widest">Active Barter</span>
                  <span className="material-symbols-outlined text-xs">check_circle</span>
                </div>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="bg-surface-container-lowest p-8 rounded-3xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-tertiary-container/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary">verified_user</span>
                </div>
                <h3 className="text-2xl font-bold text-on-surface">Verified Tutors</h3>
                <p className="text-secondary leading-relaxed">Learn from peers who have already aced the course. We verify grades and student IDs for total peace of mind.</p>
              </div>
              <div className="mt-6 flex justify-end">
                <span className="material-symbols-outlined text-tertiary text-4xl opacity-20">school</span>
              </div>
            </div>
            {/* Feature 4 */}
            <div className="md:col-span-4 lg:col-span-2 bg-surface-container-lowest p-8 rounded-3xl flex items-center gap-8 group">
              <div className="w-1/2 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">hub</span>
                </div>
                <h3 className="text-2xl font-bold text-on-surface">Study Hub</h3>
                <p className="text-secondary leading-relaxed">Access and share detailed notes, annotated readings, and flashcards in a centralized marketplace.</p>
              </div>
              <div className="w-1/2">
                <img
                  alt="Study Hub"
                  className="rounded-2xl shadow-lg group-hover:-rotate-2 transition-transform duration-500"
                  src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80"
                />
              </div>
            </div>
            {/* Feature 5 Extra (Academic Integrity) */}
            <div className="md:col-span-2 bg-[#1b1b1e] p-8 rounded-3xl text-white flex items-center justify-between overflow-hidden relative">
              <div className="space-y-4 relative z-10">
                <h3 className="text-2xl font-bold">Academic Integrity</h3>
                <p className="text-white/70 leading-relaxed max-w-sm">Built-in safeguards to ensure PeerGig remains a platform for learning assistance, not cheating. Our Ethics Board oversees all marketplace content.</p>
              </div>
              <span className="material-symbols-outlined text-[10rem] text-white/5 absolute -right-4 -bottom-10">gavel</span>
            </div>
          </div>
        </div>
      </section>

      {/* Study Notes Marketplace Highlight */}
      <section className="py-24 px-8 max-w-[1440px] mx-auto overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-20">
          <div className="w-full md:w-1/2 relative">
            <div className="aspect-square bg-surface-container-low rounded-[4rem] relative overflow-hidden">
              <img
                alt="Learning Platform"
                className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-80"
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 border-2 border-primary/10 rounded-[3rem] -rotate-6 pointer-events-none"></div>
          </div>
          <div className="w-full md:w-1/2 space-y-10">
            <div className="space-y-4">
              <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs">A Better Way to Learn</span>
              <h2 className="text-5xl font-extrabold tracking-tight text-on-surface leading-tight">Beyond Tutoring. <br />The Peer-Powered <span className="italic font-normal text-primary">Vault</span>.</h2>
              <p className="text-secondary text-lg leading-relaxed">
                Why reinvent the wheel? Access thousands of student-created study guides, lecture annotations, and exam blueprints. PeerGig organizes knowledge so you can master your curriculum faster.
              </p>
            </div>
            <ul className="space-y-6">
              <li className="flex items-start space-x-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface">AI-Powered Content Curation</p>
                  <p className="text-sm text-secondary">Our systems categorize notes by university, course code, and professor.</p>
                </div>
              </li>
              <li className="flex items-start space-x-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface">Quality Assured</p>
                  <p className="text-sm text-secondary">Community-rated content ensures only the most helpful materials rise to the top.</p>
                </div>
              </li>
            </ul>
            <Link href="/login">
              <button className="px-8 py-4 bg-on-surface text-white font-bold rounded-xl active:scale-95 transition-transform shadow-lg">
                Explore the Hub
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted border-t border-on-surface/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-12 py-16 max-w-[1440px] mx-auto">
          <div className="space-y-6">
            <div className="text-2xl font-extrabold text-[#1b1b1e]">PeerGig</div>
            <p className="text-[#5f5e61] max-w-sm text-sm leading-relaxed">
              The decentralized academic marketplace where students empower students. Micro-learning for a micro-economy.
            </p>
            <div className="flex space-x-4">
              {["share", "public"].map((icon) => (
                <button
                  key={icon}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-secondary hover:text-primary transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-lg">{icon}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#1b1b1e]">Marketplace</h4>
              <ul className="space-y-2">
                <li><Link className="text-[#5f5e61] text-sm hover:text-[#1b1b1e] transition-all" href="/search">Browse Gigs</Link></li>
                <li><Link className="text-[#5f5e61] text-sm hover:text-[#1b1b1e] transition-all" href="#how-it-works">How it Works</Link></li>
                <li><Link className="text-[#5f5e61] text-sm hover:text-[#1b1b1e] transition-all" href="/login">Tutor Verification</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#1b1b1e]">Company</h4>
              <ul className="space-y-2">
                <li><Link className="text-[#5f5e61] text-sm hover:text-[#1b1b1e] transition-all" href="#">Academic Integrity</Link></li>
                <li><Link className="text-[#5f5e61] text-sm hover:text-[#1b1b1e] transition-all" href="#">Support</Link></li>
                <li><Link className="text-[#5f5e61] text-sm hover:text-[#1b1b1e] transition-all" href="#">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-12 pb-12">
          <p className="text-[#5f5e61] text-xs border-t border-[#1b1b1e]/5 pt-8">
            © 2024 PeerGig Academic Marketplace. All rights reserved. Built for students, by students.
          </p>
        </div>
      </footer>

      {/* CHATBOT LAYOUT */}
      <ChatbotLayout />
    </div>
  );
}
