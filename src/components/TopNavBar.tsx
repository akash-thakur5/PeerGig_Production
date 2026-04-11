"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function TopNavBar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/users/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(console.error);
  }, []);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/tutor', label: 'Become Tutor' },
    { href: '/skillswap', label: 'Skillswap' },
    { href: '/connect', label: 'Peer Connect' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-[#ffffff]/80 backdrop-blur-md border-b border-[#f6f2f7] shadow-sm flex justify-between items-center px-8 py-3">
      <Link href="/" className="text-2xl font-black text-[#1b1b1e] tracking-tighter font-headline shrink-0">
        PeerGig
      </Link>
      
      <div className="hidden md:flex items-center gap-8">
        <nav className="flex gap-8 font-headline font-semibold tracking-tight text-sm">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href}
                href={link.href}
                className={`transition-all duration-200 uppercase tracking-widest ${
                  isActive 
                    ? 'text-primary border-b-2 border-primary pb-1' 
                    : 'text-[#5f5e61] hover:text-[#1b1b1e]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4 border-l border-[#f6f2f7] pl-6 ml-2">
          {/* Notifications */}
          <button className="material-symbols-outlined text-secondary hover:text-primary transition-all duration-200 cursor-pointer p-2 hover:scale-110 active:scale-95 leading-none">
            notifications
          </button>
          
          {/* Messages/Chat */}
          <Link href="/messages" className="flex items-center group p-2 rounded-full hover:bg-surface-container transition-all">
            <span className="material-symbols-outlined text-secondary group-hover:text-primary transition-all duration-200 group-hover:scale-110 active:scale-95 leading-none">
              chat
            </span>
          </Link>

          {/* Profile Avatar */}
          <Link href="/profile" className="flex items-center group gap-3 ml-2">
            <div className="text-right hidden lg:block">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Verified User</p>
              <p className="text-xs font-bold text-on-surface truncate max-w-[100px]">{user?.name || 'Loading...'}</p>
            </div>
            <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-primary-fixed group-hover:ring-4 group-hover:ring-primary/10 transition-all duration-300">
              <Image 
                alt="Profile photo" 
                fill
                className="object-cover" 
                src={user?.avatar_url || 'https://lh3.googleusercontent.com/a/default-user'} 
                sizes="36px"
              />
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile Menu Icon (Placeholder for functionality) */}
      <div className="md:hidden flex items-center gap-4">
         <Link href="/wallet" className="material-symbols-outlined text-secondary">account_balance_wallet</Link>
         <span className="material-symbols-outlined text-secondary">menu</span>
      </div>
    </header>
  );
}
