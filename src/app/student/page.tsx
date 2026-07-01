import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import TopNavBar from '@/components/TopNavBar';
import Link from 'next/link';
import { cookies } from 'next/headers';
import CountdownTimer from '@/components/CountdownTimer';
import SearchFilters from '@/components/SearchFilters';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Gig {
  id: number;
  title: string;
  subject: string;
  price_per_session: string;
  tutor_name: string;
  tutor_avatar: string;
  tutor_rating: string;
  language?: string;
  tags?: string[];
}

interface Booking {
  id: number;
  gig_title: string;
  tutor_name: string;
  scheduled_at: string | null;
  status: string;
  meet_link: string | null;
}

// ─── Data Fetching ────────────────────────────────────────────────────────────
async function getGigs(q = '', subject = '', sort = 'newest', language = ''): Promise<Gig[]> {
  try {
    const params = new URLSearchParams({ q, subject, sort, language, limit: '50' });
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/gigs?${params}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.gigs ?? [];
  } catch {
    return [];
  }
}

async function getMyBookings(): Promise<Booking[]> {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/bookings`, {
      cache: 'no-store',
      headers: { Cookie: allCookies },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.learningBookings ?? [];
  } catch {
    return [];
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function StudentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; subject?: string; sort?: string; language?: string }>;
}) {
  const { q = '', subject = '', sort = 'newest', language = '' } = await searchParams;
  const [gigs, bookings] = await Promise.all([getGigs(q, subject, sort, language), getMyBookings()]);

  const upcomingBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending');
  const paidGigs = gigs.filter(g => parseFloat(g.price_per_session) > 0);
  const freeGigs = gigs.filter(g => parseFloat(g.price_per_session) === 0);

  const freeGigsWithTarget = freeGigs.map(gig => ({
    ...gig,
    targetDate: new Date(Date.now() + ((gig.id % 5) + 1) * 3600000 + 450000).toISOString()
  }));

  return (
    <div className="bg-background text-on-surface font-body min-h-screen">
      {/* TopNavBar */}
      <TopNavBar />

      <div className="flex pt-16 min-h-screen">
        {/* SideNavBar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-10 min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
            
            {/* Left Column: Search and Gigs */}
            <div className="col-span-12 lg:col-span-8 space-y-10">
              {/* Header & Search */}
              <header className="space-y-6 text-left">
                <h1 className="text-5xl font-headline font-black text-on-surface tracking-tight leading-tight">
                  Find a Topic to <span className="text-primary italic">Learn</span>
                </h1>
                <form className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors">search</span>
                      <input
                        className="w-full pl-12 pr-4 py-4 bg-white border-0 border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 text-on-surface placeholder:text-secondary/60 transition-all text-lg outline-none"
                        placeholder="What do you want to learn? (e.g., React Hooks, Calculus)"
                        type="text"
                        name="q"
                        defaultValue={q}
                      />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-8 py-4 bg-[#ff8c00] text-white rounded-xl text-sm font-bold hover:-translate-y-0.5 transition-all shadow-lg shadow-orange-500/20" type="submit">
                      Search Gigs
                    </button>
                  </div>
                  
                  <SearchFilters q={q} subject={subject} sort={sort} language={language} />
                </form>
              </header>
              
              {/* Available Gigs Feed */}
              <section className="space-y-6">
                <div className="flex justify-between items-end">
                  <h2 className="text-xl font-headline font-bold text-on-surface">
                    {q ? `Results for "${q}"` : 'Premium Gigs'}
                  </h2>
                  <span className="text-xs font-label uppercase tracking-widest text-secondary">{paidGigs.length} Available</span>
                </div>

                {paidGigs.length === 0 ? (
                  <div className="text-center py-16 text-secondary">
                    <span className="material-symbols-outlined text-5xl mb-4 block">search_off</span>
                    <p className="font-headline font-bold text-lg">No premium gigs found</p>
                    <p className="text-sm mt-1">Try a different search term or check back later.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {paidGigs.map((gig) => (
                      <div key={gig.id} className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-surface-container-low group hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">{gig.subject}</span>
                            <span className="px-3 py-1 bg-surface-container text-secondary text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">language</span>
                              {gig.language || 'English'}
                            </span>
                          </div>
                          <span className="text-2xl font-black text-primary">₹{parseFloat(gig.price_per_session).toFixed(0)}</span>
                        </div>
                        <h3 className="text-xl font-headline font-bold text-on-surface mb-3 leading-snug group-hover:text-primary transition-colors">{gig.title}</h3>
                        {gig.tags && gig.tags.length > 0 && (
                          <div className="mb-4 flex flex-wrap gap-1.5">
                            {gig.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container-low text-secondary text-[10px] font-semibold rounded-md">
                                <span className="material-symbols-outlined text-[10px] text-green-500" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                {tag}
                              </span>
                            ))}
                            {gig.tags.length > 3 && (
                              <span className="px-2 py-0.5 text-primary text-[10px] font-bold">+{gig.tags.length - 3} more</span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full border-2 border-white shadow-sm overflow-hidden relative">
                              {gig.tutor_avatar ? (
                                <Image fill className="object-cover" src={gig.tutor_avatar} alt={gig.tutor_name} />
                              ) : (
                                <span className="material-symbols-outlined w-full h-full flex items-center justify-center text-secondary">account_circle</span>
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-on-surface">{gig.tutor_name}</p>
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm text-[#ff8c00]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="text-[10px] font-bold text-secondary">{gig.tutor_rating}</span>
                              </div>
                            </div>
                          </div>
                          <Link href={`/book-session?gigId=${gig.id}`} className="px-5 py-2.5 bg-[#ff8c00] text-white text-xs font-bold rounded-lg shadow-lg shadow-orange-500/20 active:scale-95 transition-all text-center inline-block">
                            Book Session
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Free Gigs Feed */}
              {freeGigs.length > 0 && (
                <section className="space-y-6 mt-12 bg-green-50/50 p-8 rounded-3xl border border-green-100 dark:bg-green-900/10 dark:border-green-900/30">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-2xl text-green-600 dark:text-green-400">
                        <span className="material-symbols-outlined text-3xl block">volunteer_activism</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-headline font-bold text-green-800 dark:text-green-300">
                          Free Gigs
                        </h2>
                        <p className="text-green-700/80 dark:text-green-400/80 text-sm mt-1 max-w-lg">
                          Try out demo classes and introductory sessions from tutors completely for free!
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-label uppercase tracking-widest text-green-700 dark:text-green-300 font-bold bg-green-200/50 dark:bg-green-900/50 px-4 py-2 rounded-xl text-center self-start md:self-auto min-w-[max-content]">
                      {freeGigsWithTarget.length} Free
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                    {freeGigsWithTarget.map((gig) => (
                      <div key={gig.id} className="bg-white rounded-2xl p-6 shadow-sm border border-green-200 hover:shadow-xl hover:shadow-green-500/10 hover:border-green-400 transition-all duration-300 flex flex-col cursor-pointer overflow-hidden relative group">
                        <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow-sm z-10">
                          100% Free
                        </div>
                        <div className="flex justify-between items-start mb-4 mt-2 gap-4">
                          <div className="flex flex-wrap gap-2 self-start">
                            <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full">{gig.subject}</span>
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">language</span>
                              {gig.language || 'English'}
                            </span>
                          </div>
                          <CountdownTimer targetDate={gig.targetDate} />
                        </div>
                        <h3 className="text-xl font-headline font-black text-green-900 mb-3 leading-snug group-hover:text-green-600 transition-colors relative z-10">{gig.title}</h3>
                        {gig.tags && gig.tags.length > 0 && (
                          <div className="mb-4 flex flex-wrap gap-1.5">
                            {gig.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-800 text-[10px] font-semibold rounded-md">
                                <span className="material-symbols-outlined text-[10px] text-green-500" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                {tag}
                              </span>
                            ))}
                            {gig.tags.length > 3 && (
                              <span className="px-2 py-0.5 text-green-600 text-[10px] font-bold">+{gig.tags.length - 3} more</span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-green-100">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full border-2 border-white shadow-sm overflow-hidden relative">
                              {gig.tutor_avatar ? (
                                <Image fill className="object-cover" src={gig.tutor_avatar} alt={gig.tutor_name} />
                              ) : (
                                <span className="material-symbols-outlined w-full h-full flex items-center justify-center text-secondary bg-green-50">account_circle</span>
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-on-surface">{gig.tutor_name}</p>
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm text-[#ff8c00]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="text-[10px] font-bold text-secondary">{gig.tutor_rating}</span>
                              </div>
                            </div>
                          </div>
                          <Link href={`/book-session?gigId=${gig.id}`} className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/40 hover:-translate-y-0.5 active:scale-95 transition-all text-center inline-flex items-center gap-2">
                            <span>Join for Free</span>
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
          </div>

          {/* Right Column: Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            {/* Upcoming Sessions */}
            <section className="bg-white rounded-3xl p-8 border border-surface-container-low shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-headline font-extrabold text-on-surface">Upcoming Sessions</h2>
                <span className="text-[10px] font-label uppercase tracking-widest bg-primary-fixed px-2 py-1 rounded text-primary">{upcomingBookings.length} Booked</span>
              </div>
              <div className="space-y-4">
                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-8 text-secondary">
                    <span className="material-symbols-outlined text-3xl block mb-2">event_available</span>
                    <p className="text-sm">No upcoming sessions. Book a gig!</p>
                  </div>
                ) : (
                  upcomingBookings.slice(0, 3).map((booking: any) => (
                    <div key={booking.id} className={`p-4 rounded-2xl space-y-3 cursor-pointer ${booking.status === 'confirmed' ? 'border-l-4 border-primary bg-surface-container-low' : 'border border-surface-container-low bg-surface-container-lowest'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-label uppercase tracking-widest text-secondary mb-1">
                            {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                          </p>
                          <h4 className="font-bold text-on-surface text-sm">{booking.gig_title}</h4>
                          <p className="text-xs text-secondary mt-0.5">with {booking.tutor_name}</p>
                        </div>
                        <span className="material-symbols-outlined text-primary">{booking.status === 'confirmed' ? 'video_camera_front' : 'schedule'}</span>
                      </div>
                      {booking.scheduled_at && (
                        <div className="flex items-center gap-2 text-xs font-medium text-secondary">
                          <span className="material-symbols-outlined text-sm">calendar_today</span>
                          {new Date(booking.scheduled_at).toLocaleString()}
                        </div>
                      )}
                      {booking.status === 'confirmed' && (
                        <Link href={`/meeting/${booking.id}`} className="w-full py-2.5 flex items-center justify-center gap-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 hover:-translate-y-0.5 transition-all">
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>videocam</span> Join Meeting
                        </Link>
                      )}
                      {booking.status === 'pending' && (
                        <div className="w-full py-2 flex items-center justify-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl text-xs font-bold">
                          <span className="material-symbols-outlined text-sm">schedule</span> Awaiting Tutor Approval
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              <Link className="block text-center mt-6 text-xs font-bold text-primary hover:underline underline-offset-4" href="/history">View All Learning History</Link>
            </section>

            {/* Quick Stats */}
            <section className="bg-[#1b1b1e] rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-headline font-bold text-lg mb-2">Your Activity</h3>
                <p className="text-white/60 text-xs mb-6">Total sessions booked this month</p>
                <div className="text-5xl font-black">{bookings.length}</div>
                <p className="text-white/60 text-sm mt-2">sessions total</p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary opacity-20 rounded-full blur-3xl"></div>
            </section>
          </div>
        </div>
      </main>

      {/* FAB for Quick Actions (Mobile) */}
      <button className="lg:hidden fixed bottom-8 right-8 h-16 w-16 bg-gradient-to-br from-[#904d00] to-[#ff8c00] rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 w-full lg:hidden bg-[#ffffff]/90 dark:bg-zinc-950/90 backdrop-blur-md border-t border-surface-container-low flex justify-around p-3 z-40">
        <Link className="flex flex-col items-center gap-1 text-secondary hover:text-primary transition-colors" href="/dashboard">
          <span className="material-symbols-outlined w-6 h-6 flex justify-center items-center">dashboard</span>
          <span className="text-[10px] font-bold">Dash</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 text-primary transition-colors" href="/student">
          <span className="material-symbols-outlined w-6 h-6 flex justify-center items-center">person_search</span>
          <span className="text-[10px] font-bold">Search</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 text-secondary hover:text-primary transition-colors" href="/tutor">
          <span className="material-symbols-outlined w-6 h-6 flex justify-center items-center">school</span>
          <span className="text-[10px] font-bold">Teach</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 text-secondary hover:text-primary transition-colors" href="/skillswap">
          <span className="material-symbols-outlined w-6 h-6 flex justify-center items-center">swap_horiz</span>
          <span className="text-[10px] font-bold">Swap</span>
        </Link>
      </nav>
      </div>
    </div>
  );
}
