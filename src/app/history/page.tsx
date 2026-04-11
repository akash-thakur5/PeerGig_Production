"use client";

import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TopNavBar from '@/components/TopNavBar';
import { useState, useEffect } from 'react';

interface Booking {
  id: number;
  gig_title: string;
  gig_subject: string;
  price_per_session: string;
  tutor_name: string;
  tutor_avatar: string;
  scheduled_at: string;
  status: string;
  meet_link: string | null;
}

export default function LearningHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setBookings(data.learningBookings || []);
      })
      .catch(err => setError(err.message || 'Failed to fetch history'))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: bookings.length,
    attended: bookings.filter(b => b.status === 'completed').length,
    upcoming: bookings.filter(b => b.status === 'confirmed').length
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <TopNavBar />
      <Sidebar />

      <main className="lg:ml-64 mt-16 p-8 min-h-screen bg-surface-container-low">
        <div className="max-w-6xl mx-auto mb-10">
            <Link className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors text-sm font-medium mb-6 group" href="/student">
                <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Back to Student Dashboard
            </Link>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-manrope mb-2">Learning History</h1>
                    <p className="text-secondary text-lg max-w-2xl font-body">Track your educational journey, review past interactions, and access lesson notes from your peer tutors.</p>
                </div>
            </div>
        </div>

        {/* Stats Row */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-primary">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">menu_book</span>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-secondary font-bold font-headline">Total Booked</p>
                        <h3 className="text-3xl font-extrabold text-on-surface font-manrope">{stats.total}</h3>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <span className="material-symbols-outlined">check_circle</span>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-secondary font-bold font-headline">Attended</p>
                        <h3 className="text-3xl font-extrabold text-on-surface font-manrope">{stats.attended}</h3>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-400">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                        <span className="material-symbols-outlined">calendar_clock</span>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-secondary font-bold font-headline">Upcoming</p>
                        <h3 className="text-3xl font-extrabold text-on-surface font-manrope">{stats.upcoming}</h3>
                    </div>
                </div>
            </div>
        </div>

        <section className="max-w-6xl mx-auto">
            {loading ? (
                <div className="text-center py-20">
                    <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 text-red-700 rounded-xl">{error}</div>
            ) : bookings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-neutral-100">
                    <span className="material-symbols-outlined text-5xl text-neutral-300 mb-4 block">history_edu</span>
                    <p className="text-neutral-500">Your learning history is empty. Start booking sessions!</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-100">
                    <div className="divide-y divide-neutral-50 font-manrope">
                        {bookings.map((b, idx) => (
                            <div key={b.id} className="flex flex-col md:flex-row items-center justify-between p-6 hover:bg-zinc-50 transition-colors group">
                                <div className="flex items-center gap-6 w-full md:w-1/3">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 font-bold">
                                        {(idx + 1).toString().padStart(2, '0')}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">{b.gig_title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            {b.tutor_avatar && (
                                                <div className="w-5 h-5 rounded-full overflow-hidden">
                                                    <img alt="Tutor avatar" className="w-full h-full object-cover" src={b.tutor_avatar} />
                                                </div>
                                            )}
                                            <span className="text-sm text-secondary font-medium">Taught by {b.tutor_name}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-12 w-full md:w-1/3 justify-center py-4 md:py-0">
                                    <div className="flex items-center gap-2 text-secondary">
                                        <span className="material-symbols-outlined text-xl">calendar_today</span>
                                        <span className="text-sm font-medium">
                                            {b.scheduled_at ? new Date(b.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not scheduled'}
                                        </span>
                                    </div>
                                    <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                        b.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                                        b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                        b.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-neutral-100 text-neutral-600'
                                    }`}>
                                        {b.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-1/3">
                                    <span className="text-xl font-bold text-primary">₹{parseInt(b.price_per_session)}</span>
                                    <div className="flex items-center gap-4">
                                        {b.status === 'completed' ? (
                                            <button className="flex items-center gap-1 py-2 px-4 border border-neutral-200 rounded-lg text-secondary hover:text-primary hover:border-primary transition-all text-sm font-bold">
                                                <span className="material-symbols-outlined text-lg">star</span>
                                                Leave Review
                                            </button>
                                        ) : b.meet_link ? (
                                            <a href={b.meet_link} target="_blank" className="py-2 px-4 bg-primary text-white rounded-lg text-sm font-bold">Join Meet</a>
                                        ) : (
                                            <button className="text-sm font-bold text-neutral-400 cursor-not-allowed">Waiting...</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
      </main>
    </div>
  );
}
