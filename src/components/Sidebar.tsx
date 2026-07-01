"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { href: '/student', icon: 'school', label: 'Explore Gigs' },
    { href: '/tutor', icon: 'add_circle', label: 'Become Tutor' },
    { href: '/skillswap', icon: 'swap_horiz', label: 'Skillswap' },
    { href: '/connect', icon: 'group', label: 'Peer Connect' },
    { href: '/wallet', icon: 'account_balance_wallet', label: 'Wallet', fill: true },
    { href: '/notes', icon: 'description', label: 'Notes' },
    { href: '/store', icon: 'storefront', label: 'Store' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 pt-4 md:pt-[76px] hidden lg:flex flex-col bg-surface-container-low border-r border-outline-variant/10 p-6 z-40">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold text-on-surface tracking-tight font-headline">PeerGig</h1>
        <p className="text-xs text-secondary font-medium uppercase tracking-widest font-headline">Learn • Earn • Grow</p>
      </div>
      <nav className="flex flex-col gap-1 mb-6">
        {links.map((link) => {
          // Highlight if current path starts with link.href (except for EXACT matches like dashboard)
          const isActive =
            link.href === '/dashboard' || link.href === '/wallet' || link.href === '/student' || link.href === '/store'
              ? pathname === link.href
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-headline text-sm font-semibold uppercase tracking-wider group ${
                isActive
                  ? 'text-primary font-bold bg-surface-container-lowest shadow-sm'
                  : 'text-secondary hover:bg-surface-container'
              }`}
            >
              <span
                className={`material-symbols-outlined transition-all duration-200 group-hover:scale-110 leading-none ${
                  isActive ? 'fill-active' : ''
                }`}
              >
                {link.icon}
              </span>
              <span>{link.label}</span>
            </Link>
          );
        })}

        {/* Logout Button */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-headline text-sm font-semibold uppercase tracking-wider text-secondary hover:bg-red-50 hover:text-red-500 mt-2 text-left w-full group"
        >
          <span className="material-symbols-outlined group-hover:rotate-12 transition-transform leading-none">logout</span>
          <span>Logout</span>
        </button>
      </nav>
      <div className="mt-auto p-2">
        <Link
          href="/tutor"
          className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-lg hover:translate-y-[-2px] transition-transform duration-200 block text-center uppercase tracking-widest font-headline text-sm"
        >
          Become Tutor
        </Link>
      </div>
    </aside>
  );
}
