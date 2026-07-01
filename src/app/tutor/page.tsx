"use client";

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopNavBar from '@/components/TopNavBar';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Gig {
  id: number;
  title: string;
  subject: string;
  price_per_session: string;
  is_active: boolean;
  booking_count: string;
}

interface Booking {
  id: number;
  gig_title: string;
  student_name: string;
  student_avatar: string;
  scheduled_at: string | null;
  status: string;
  price_per_session: string;
}

interface UserStats {
  name: string;
  rating: string;
  active_gigs: number;
  total_earned: number;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TutorDashboardPage() {
  const [myGigs, setMyGigs] = useState<Gig[]>([]);
  const [teachingBookings, setTeachingBookings] = useState<Booking[]>([]);
  const [user, setUser] = useState<UserStats>({ name: 'Tutor', rating: '0', active_gigs: 0, total_earned: 0 });
  const [loading, setLoading] = useState(true);
  // Track which gig IDs are currently being toggled (for loading state on button)
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [gigsRes, bookingsRes, userRes] = await Promise.all([
          fetch('/api/gigs/mine'),
          fetch('/api/bookings'),
          fetch('/api/users/me'),
        ]);
        const [gigsData, bookingsData, userData] = await Promise.all([
          gigsRes.ok ? gigsRes.json() : null,
          bookingsRes.ok ? bookingsRes.json() : null,
          userRes.ok ? userRes.json() : null,
        ]);
        setMyGigs(gigsData?.gigs ?? []);
        setTeachingBookings(bookingsData?.teachingBookings ?? []);
        setUser(userData?.user ?? { name: 'Tutor', rating: '0', active_gigs: 0, total_earned: 0 });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // ─── Toggle active/inactive ──────────────────────────────────────────────────
  const toggleGigStatus = async (gig: Gig) => {
    // Optimistic update — flip locally immediately
    setMyGigs((prev) =>
      prev.map((g) => (g.id === gig.id ? { ...g, is_active: !g.is_active } : g))
    );
    setTogglingIds((prev) => new Set(prev).add(gig.id));

    try {
      const res = await fetch(`/api/gigs/${gig.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !gig.is_active }),
      });
      if (!res.ok) {
        // Roll back on failure
        setMyGigs((prev) =>
          prev.map((g) => (g.id === gig.id ? { ...g, is_active: gig.is_active } : g))
        );
      }
    } catch {
      // Roll back on network error
      setMyGigs((prev) =>
        prev.map((g) => (g.id === gig.id ? { ...g, is_active: gig.is_active } : g))
      );
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(gig.id);
        return next;
      });
    }
  };

  const handleDeleteGig = async (gigId: number) => {
    if (!confirm('Are you sure you want to delete this gig? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/gigs/${gigId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMyGigs((prev) => prev.filter((g) => g.id !== gigId));
      } else {
        alert('Failed to delete gig');
      }
    } catch {
      alert('Network error while deleting gig');
    } finally {
      setOpenMenuId(null);
    }
  };

  const activeGigs = myGigs.filter((g) => g.is_active);
  const pendingBookings = teachingBookings.filter((b) => b.status === 'pending');
  const confirmedBookings = teachingBookings.filter((b) => b.status === 'confirmed');
  const upcomingBookings = teachingBookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending'
  );

  // ─── Accept / Reject handlers ───────────────────────────────────────────────
  const [actionLoading, setActionLoading] = useState<Record<number, string>>({});

  const handleBookingAction = async (bookingId: number, action: 'accept' | 'reject') => {
    setActionLoading((prev) => ({ ...prev, [bookingId]: action }));
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        // Update local state
        setTeachingBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? { ...b, status: action === 'accept' ? 'confirmed' : 'cancelled' }
              : b
          )
        );
      }
    } catch {
      // Silent fail
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[bookingId];
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">sync</span>
          <p className="mt-4 text-secondary">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      {/* TopNavBar */}
      <TopNavBar />

      <div className="flex min-h-screen pt-16">
        {/* SideNavBar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="lg:ml-64 flex-1 p-6 lg:p-10 bg-background">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface mb-2">Become Tutor Dashboard</h1>
              <p className="text-lg text-secondary">Manage your earnings, gigs, and requests from students.</p>
            </div>
            <Link
              href="/tutor/create"
              className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined">add</span>
              Create New Gig
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary-fixed rounded-xl text-primary">
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                </div>
                <span className="text-sm font-semibold uppercase tracking-widest text-secondary">Total Earned</span>
              </div>
              <div className="text-3xl font-headline font-bold text-on-surface">₹{user.total_earned.toFixed(2)}</div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-tertiary-fixed rounded-xl text-tertiary">
                  <span className="material-symbols-outlined">book</span>
                </div>
                <span className="text-sm font-semibold uppercase tracking-widest text-secondary">Active Gigs</span>
              </div>
              <div className="text-3xl font-headline font-bold text-on-surface">{activeGigs.length}</div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary-fixed rounded-xl text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <span className="text-sm font-semibold uppercase tracking-widest text-secondary">Tutor Rating</span>
              </div>
              <div className="text-3xl font-headline font-bold text-on-surface">{parseFloat(user.rating || '0').toFixed(1)} / 5.0</div>
            </div>
            <div className="bg-yellow-50 p-6 rounded-xl shadow-sm border border-yellow-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-yellow-100 rounded-xl text-yellow-700">
                  <span className="material-symbols-outlined">pending_actions</span>
                </div>
                <span className="text-sm font-semibold uppercase tracking-widest text-yellow-700">Pending Requests</span>
              </div>
              <div className="text-3xl font-headline font-bold text-yellow-800">{pendingBookings.length}</div>
            </div>
          </div>

          {/* ═══ Pending Booking Requests ═══ */}
          {pendingBookings.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-100 rounded-xl">
                  <span className="material-symbols-outlined text-yellow-700 text-2xl">notifications_active</span>
                </div>
                <div>
                  <h2 className="text-2xl font-headline font-bold text-on-surface">Student Booking Requests</h2>
                  <p className="text-sm text-secondary">Students are waiting for your response. Accept or reject their session requests.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {pendingBookings.map((booking) => {
                  const isAccepting = actionLoading[booking.id] === 'accept';
                  const isRejecting = actionLoading[booking.id] === 'reject';
                  const isProcessing = isAccepting || isRejecting;
                  return (
                    <div
                      key={booking.id}
                      className="bg-white rounded-2xl p-6 border-l-4 border-yellow-400 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center gap-6"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center text-lg font-bold text-yellow-800 shrink-0">
                          {booking.student_name?.charAt(0) ?? 'S'}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface text-lg">{booking.student_name}</p>
                          <p className="text-sm text-secondary">wants to book <span className="font-semibold text-on-surface">{booking.gig_title}</span></p>
                          <div className="flex items-center gap-3 mt-1.5">
                            {booking.scheduled_at && (
                              <span className="inline-flex items-center gap-1 text-xs text-secondary">
                                <span className="material-symbols-outlined text-xs">calendar_today</span>
                                {new Date(booking.scheduled_at).toLocaleString()}
                              </span>
                            )}
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase tracking-wider rounded-full">Pending</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                        <span className="text-lg font-black text-primary">
                          {parseFloat(booking.price_per_session) > 0 ? `₹${parseFloat(booking.price_per_session).toFixed(0)}` : 'Free'}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleBookingAction(booking.id, 'accept')}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 px-5 py-2.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 hover:-translate-y-0.5 active:scale-95 transition-all shadow-md shadow-green-500/20 disabled:opacity-50 disabled:translate-y-0"
                          >
                            <span className={`material-symbols-outlined text-lg ${isAccepting ? 'animate-spin' : ''}`}>
                              {isAccepting ? 'sync' : 'check_circle'}
                            </span>
                            {isAccepting ? 'Accepting...' : 'Accept'}
                          </button>
                          <button
                            onClick={() => handleBookingAction(booking.id, 'reject')}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 px-5 py-2.5 border border-red-200 text-red-600 font-bold text-sm rounded-xl hover:bg-red-50 active:scale-95 transition-all disabled:opacity-50"
                          >
                            <span className={`material-symbols-outlined text-lg ${isRejecting ? 'animate-spin' : ''}`}>
                              {isRejecting ? 'sync' : 'cancel'}
                            </span>
                            {isRejecting ? 'Rejecting...' : 'Reject'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Your Gigs Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-headline font-bold">Your Active Gigs</h2>
              <div className="flex items-center gap-2 text-xs text-secondary bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant/10">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                {activeGigs.length} active
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block ml-1"></span>
                {myGigs.length - activeGigs.length} inactive
              </div>
            </div>

            {myGigs.length === 0 ? (
              <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 text-secondary">
                <span className="material-symbols-outlined text-5xl mb-4 block">school</span>
                <p className="font-headline font-bold text-lg">No gigs yet</p>
                <p className="text-sm mt-1 mb-6">Create your first gig to start earning!</p>
                <Link href="/tutor/create" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm">
                  <span className="material-symbols-outlined text-lg">add</span>Create First Gig
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {myGigs.map((gig) => {
                  const isToggling = togglingIds.has(gig.id);
                  return (
                    <div
                      key={gig.id}
                      className={`bg-surface-container-lowest p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm hover:shadow-md transition-all border gap-6 ${
                        gig.is_active
                          ? 'border-outline-variant/10'
                          : 'border-red-100 bg-red-50/30 opacity-75'
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`h-16 w-16 rounded-xl flex items-center justify-center ${gig.is_active ? 'bg-primary/10' : 'bg-surface-container-high'}`}>
                          <span className={`material-symbols-outlined text-2xl ${gig.is_active ? 'text-primary' : 'text-secondary'}`}>school</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-on-surface">{gig.title}</h3>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            <span className="px-3 py-0.5 bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold uppercase tracking-wider rounded-full">
                              {gig.subject}
                            </span>
                            <span className={`px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${gig.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {gig.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <span className="px-3 py-0.5 bg-surface-container-low text-secondary text-[10px] font-bold uppercase tracking-wider rounded-full">
                              {gig.booking_count} bookings
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 lg:gap-10 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-right">
                          <div className="text-sm text-secondary font-medium">Rate</div>
                          <div className="font-bold text-primary">₹{parseFloat(gig.price_per_session).toFixed(0)}/session</div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* ── Toggle Active/Inactive Button ── */}
                          <button
                            id={`toggle-gig-${gig.id}`}
                            onClick={() => toggleGigStatus(gig)}
                            disabled={isToggling}
                            title={gig.is_active ? 'Deactivate gig' : 'Activate gig'}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed border ${
                              gig.is_active
                                ? 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-300'
                                : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100 hover:border-green-300'
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined text-lg leading-none ${isToggling ? 'animate-spin' : ''}`}
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              {isToggling ? 'sync' : gig.is_active ? 'pause_circle' : 'play_circle'}
                            </span>
                            {isToggling
                              ? 'Saving...'
                              : gig.is_active
                              ? 'Deactivate'
                              : 'Activate'}
                          </button>

                          <button className="px-4 py-2 border border-outline-variant text-primary font-semibold rounded-lg hover:bg-primary-fixed/30 transition-colors">
                            Edit
                          </button>
                          <div className="relative">
                            <button 
                              onClick={() => setOpenMenuId(openMenuId === gig.id ? null : gig.id)}
                              className="p-2 text-secondary hover:text-on-surface"
                            >
                              <span className="material-symbols-outlined">more_vert</span>
                            </button>
                            {openMenuId === gig.id && (
                              <div className="absolute right-0 mt-2 w-40 bg-surface rounded-xl shadow-lg border border-outline-variant/10 py-2 z-10">
                                <button 
                                  onClick={() => handleDeleteGig(gig.id)}
                                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-sm font-semibold flex items-center gap-2"
                                >
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Confirmed Sessions Section */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-outline-variant/5">
            <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
              <h2 className="text-xl font-headline font-bold">Confirmed Sessions</h2>
              <span className="text-sm text-secondary">{confirmedBookings.length} confirmed</span>
            </div>
            {confirmedBookings.length === 0 ? (
              <div className="text-center py-16 text-secondary">
                <span className="material-symbols-outlined text-4xl mb-3 block">event_available</span>
                <p>No confirmed sessions yet. Accept pending requests to get started!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="bg-surface-container-low/30">
                      <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-secondary/60">Student Name</th>
                      <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-secondary/60">Topic</th>
                      <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-secondary/60">Date/Time</th>
                      <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-secondary/60">Status</th>
                      <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-secondary/60 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {confirmedBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-surface-container-low/20 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-secondary-container flex items-center justify-center text-xs font-bold text-secondary">
                              {booking.student_name?.charAt(0) ?? 'S'}
                            </div>
                            <span className="font-semibold">{booking.student_name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-on-surface/80">{booking.gig_title}</td>
                        <td className="px-8 py-5 font-medium">
                          {booking.scheduled_at ? new Date(booking.scheduled_at).toLocaleString() : 'TBD'}
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">
                            Confirmed
                          </span>
                        </td>
                          <td className="px-8 py-5 text-right">
                            <Link
                              href={`/meeting/${booking.id}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 hover:-translate-y-0.5 transition-all"
                            >
                              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>videocam</span>
                              Join Meeting
                            </Link>
                          </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
