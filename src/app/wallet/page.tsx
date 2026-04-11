"use client";

import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import TopNavBar from '@/components/TopNavBar';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Transaction {
  id: number;
  amount: string;
  type: 'credit' | 'debit';
  description: string;
  created_at: string;
}

interface WalletData {
  balance: number;
  credits: number;
  debits: number;
  teachingEarned: number;
  learningSpent: number;
  transactions: Transaction[];
}

function formatINR(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now  = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60)   return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function WalletPage() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Money modal state
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [addMethod, setAddMethod] = useState('UPI — GPay');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  useEffect(() => {
    fetch('/api/wallet')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); } else { setWalletData(data); }
        setLoading(false);
      })
      .catch(() => { setError('Failed to load wallet'); setLoading(false); });
  }, []);

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    setAddLoading(true);
    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(addAmount), method: addMethod }),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error ?? 'Failed to add money'); return; }
      setAddSuccess(`${formatINR(parseFloat(addAmount))} added successfully!`);
      setAddAmount('');
      // Re-fetch wallet data
      const walletRes = await fetch('/api/wallet');
      const walletJson = await walletRes.json();
      if (!walletJson.error) setWalletData(walletJson);
      setTimeout(() => { setShowAddMoney(false); setAddSuccess(''); }, 2000);
    } catch {
      setAddError('Network error — please try again');
    } finally {
      setAddLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">sync</span>
          <p className="mt-4 text-secondary">Loading your wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/20 min-h-screen">
      <TopNavBar />

      {/* Add Money Modal */}
      {showAddMoney && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-8 w-full max-w-md shadow-2xl border border-outline-variant/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold font-headline">Add Money to Wallet</h3>
              <button onClick={() => { setShowAddMoney(false); setAddError(''); setAddSuccess(''); }} className="text-secondary hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {addSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-green-600">check_circle</span>
                </div>
                <p className="font-bold text-on-surface">{addSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleAddMoney} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2">Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-bold text-lg">₹</span>
                    <input
                      type="number"
                      min="100"
                      max="50000"
                      step="50"
                      required
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      placeholder="500"
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-lg font-bold"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[500, 1000, 2000, 5000].map((amt) => (
                      <button key={amt} type="button" onClick={() => setAddAmount(String(amt))}
                        className="flex-1 py-1.5 text-xs font-bold bg-surface-container rounded-lg border border-outline-variant/20 hover:border-primary/40 hover:text-primary transition-all">
                        ₹{amt.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2">Payment Method</label>
                  <select
                    value={addMethod}
                    onChange={(e) => setAddMethod(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl outline-none"
                  >
                    <option>UPI — GPay</option>
                    <option>UPI — PhonePe</option>
                    <option>UPI — Paytm</option>
                    <option>Net Banking</option>
                    <option>Debit Card</option>
                  </select>
                </div>
                {addError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    {addError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={addLoading}
                  className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-md hover:translate-y-[-2px] transition-all disabled:opacity-60 disabled:translate-y-0 font-headline uppercase tracking-widest"
                >
                  {addLoading ? 'Processing...' : `Add ${addAmount ? formatINR(parseFloat(addAmount)) : 'Money'}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Master Wrapper */}
      <div className="pt-16">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="md:ml-64 min-w-0">

          {/* Dashboard Content */}
          <div className="max-w-5xl mx-auto p-8 md:p-12">
            {/* Header */}
            <div className="mb-12">
              <h2 className="text-5xl font-extrabold text-on-surface tracking-tighter mb-2 font-headline">My Wallet</h2>
              <p className="text-lg text-secondary font-body">Earn by teaching. Invest in learning. All in one place.</p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-8">
              {/* Balance Card */}
              <div className="bg-surface-container-lowest rounded-xl p-10 shadow-[0_40px_40px_-15px_rgba(27,27,30,0.04)] flex flex-col md:flex-row justify-between items-center gap-8 border border-outline-variant/10">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-secondary opacity-70 font-headline">Available Balance</p>
                  <h3 className="text-6xl font-extrabold text-on-surface tracking-tighter font-headline">
                    {walletData ? formatINR(walletData.balance) : '—'}
                  </h3>
                  <p className="text-xs text-secondary font-body mt-1">
                    Earnings are in INR • Secure wallet
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                  <button
                    onClick={() => setShowAddMoney(true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-br from-primary to-primary-container text-white px-8 py-4 rounded-xl font-bold shadow-md hover:translate-y-[-2px] transition-all font-headline uppercase tracking-widest text-sm"
                  >
                    <span className="material-symbols-outlined">add_circle</span>
                    Add Money
                  </button>
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-2 border-2 border-outline-variant/30 text-secondary px-8 py-4 rounded-xl font-bold hover:bg-surface-container-low transition-all font-headline uppercase tracking-widest text-sm">
                    <span className="material-symbols-outlined">vertical_align_bottom</span>
                    Withdraw
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 border border-green-100 rounded-xl p-6 text-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="material-symbols-outlined text-green-600">south_west</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-green-700 mb-1 font-headline">Earned Teaching</p>
                  <p className="text-2xl font-extrabold text-green-700 font-headline">
                    {walletData ? formatINR(walletData.teachingEarned) : '—'}
                  </p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="material-symbols-outlined text-red-600">north_east</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-700 mb-1 font-headline">Spent Learning</p>
                  <p className="text-2xl font-extrabold text-red-700 font-headline">
                    {walletData ? formatINR(walletData.learningSpent) : '—'}
                  </p>
                </div>
                <div className="bg-surface-container rounded-xl p-6 text-center border border-outline-variant/10">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1 font-headline">Total Deposits</p>
                  <p className="text-2xl font-extrabold text-on-surface font-headline">
                    {walletData
                      ? formatINR(walletData.transactions
                          .filter((t) => t.type === 'credit' && t.description?.startsWith('Added'))
                          .reduce((s, t) => s + parseFloat(t.amount), 0))
                      : '—'}
                  </p>
                </div>
              </div>

              {/* Transaction History */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold text-on-surface font-headline">Transaction History</h4>
                  <span className="text-sm text-secondary font-body">
                    {walletData ? `${walletData.transactions.length} transactions` : ''}
                  </span>
                </div>

                {walletData && walletData.transactions.length === 0 && (
                  <div className="text-center py-16 bg-surface-container-lowest rounded-xl border border-outline-variant/10">
                    <span className="material-symbols-outlined text-5xl text-secondary mb-4 block">account_balance_wallet</span>
                    <p className="font-headline font-bold text-on-surface">No transactions yet</p>
                    <p className="text-secondary text-sm mt-2">Book a session or post a gig to get started.</p>
                  </div>
                )}

                {walletData && walletData.transactions.length > 0 && (
                  <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden divide-y divide-outline-variant/10">
                    {walletData.transactions.map((tx) => {
                      const isCredit   = tx.type === 'credit';
                      const isEarned   = isCredit && tx.description?.startsWith('Earned:');
                      const isPaid     = !isCredit && tx.description?.startsWith('Paid:');
                      const isAdded    = isCredit && tx.description?.startsWith('Added');
                      const isWithdraw = !isCredit && (tx.description?.toLowerCase().includes('withdrawal') || tx.description?.toLowerCase().includes('withdraw'));

                      let icon = 'account_balance_wallet';
                      let iconBg = 'bg-orange-50';
                      let iconColor = 'text-orange-500';
                      let label = isCredit ? 'Credit' : 'Debit';

                      if (isEarned) { icon = 'south_west'; iconBg = 'bg-green-50'; iconColor = 'text-green-600'; label = 'Earned'; }
                      else if (isPaid) { icon = 'north_east'; iconBg = 'bg-red-50'; iconColor = 'text-red-500'; label = 'Paid'; }
                      else if (isAdded) { icon = 'add_circle'; iconBg = 'bg-blue-50'; iconColor = 'text-blue-600'; label = 'Deposit'; }
                      else if (isWithdraw) { icon = 'vertical_align_bottom'; iconBg = 'bg-purple-50'; iconColor = 'text-purple-600'; label = 'Withdrawal'; }

                      return (
                        <div key={tx.id} className="flex items-center justify-between p-6 hover:bg-surface-container-low transition-colors group cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center ${iconColor} transition-colors`}>
                              <span className="material-symbols-outlined">{icon}</span>
                            </div>
                            <div>
                              <p className="font-bold text-on-surface font-headline text-sm">{tx.description}</p>
                              <p className="text-xs text-secondary font-body mt-0.5">{timeAgo(tx.created_at)}</p>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className={`text-lg font-extrabold font-headline ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                              {isCredit ? '+' : '-'}{formatINR(parseFloat(tx.amount))}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-tighter text-secondary font-body">{label}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Insight Card */}
              <div className="bg-surface-container p-8 rounded-xl flex flex-col md:flex-row justify-between items-center gap-6 border-l-4 border-primary">
                <div>
                  <h5 className="text-xl font-bold tracking-tight mb-1 font-headline">You earn by teaching, and learn by paying</h5>
                  <p className="text-secondary font-body text-sm max-w-md">
                    Every rupee you earn from teaching can be used to learn something new. The more you teach, the more you can grow.
                  </p>
                </div>
                <Link href="/tutor/create"
                  className="shrink-0 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:translate-y-[-2px] transition-all font-headline uppercase tracking-widest text-sm whitespace-nowrap"
                >
                  Post a Gig
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom NavBar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-outline-variant/10 flex items-center justify-around px-2 z-50">
        <Link className="flex flex-col items-center gap-1 text-secondary" href="/dashboard">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-medium font-headline">Home</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 text-secondary" href="/student">
          <span className="material-symbols-outlined">school</span>
          <span className="text-[10px] font-medium font-headline">Learn</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 text-primary" href="/wallet">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
          <span className="text-[10px] font-bold font-headline">Wallet</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 text-secondary" href="/connect">
          <span className="material-symbols-outlined">group</span>
          <span className="text-[10px] font-medium font-headline">Connect</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 text-secondary" href="/profile">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-medium font-headline">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
