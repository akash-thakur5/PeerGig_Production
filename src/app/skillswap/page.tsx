"use client";

import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import TopNavBar from '@/components/TopNavBar';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SkillswapPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [schedulingRequest, setSchedulingRequest] = useState<any>(null); // For the modal

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resOffers, resReqs, resUser] = await Promise.all([
          fetch('/api/skillswaps'),
          fetch('/api/skillswaps/requests'),
          fetch('/api/users/me')
        ]);
        
        const dataOffers = await resOffers.json();
        const dataReqs = await resReqs.json();
        const dataUser = await resUser.json();

        setOffers(dataOffers.offers || []);
        setRequests(dataReqs.requests || []);
        setUser(dataUser.user || null);
      } catch (err) {
        console.error('Failed to load skillswap data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRequestAction = async (requestId: number, action: string) => {
    try {
      const res = await fetch(`/api/skillswaps/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        // Refresh requests
        const resReqs = await fetch('/api/skillswaps/requests');
        const dataReqs = await resReqs.json();
        setRequests(dataReqs.requests || []);
      }
    } catch (err) {
      console.error('Action failed', err);
    }
  };

  const handlePickSlot = async (requestId: number, slot: string) => {
    try {
      const res = await fetch(`/api/skillswaps/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'schedule', slot_choice: slot })
      });
      if (res.ok) {
        const resReqs = await fetch('/api/skillswaps/requests');
        const dataReqs = await resReqs.json();
        setRequests(dataReqs.requests || []);
        const updated = dataReqs.requests?.find((r: any) => r.id === requestId);
        setSchedulingRequest(updated);
      }
    } catch (err) {
      console.error('Slot pick failed', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center font-headline">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">sync</span>
          <p className="mt-4 text-secondary">Loading market...</p>
        </div>
      </div>
    );
  }

  const incomingRequests = requests.filter(r => r.receiver_id === user?.id && r.status === 'pending');
  const activeNegotiations = requests.filter(r => r.status === 'accepted' || r.status === 'scheduled');

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body selection:bg-primary-container selection:text-on-primary-container">
      {/* TopNavBar */}
      <TopNavBar />

      <div className="flex min-h-screen pt-16">
        <Sidebar />

        <main className="flex-grow lg:ml-64 p-8">
          <div className="max-w-6xl mx-auto pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="max-w-2xl text-on-surface">
                <h1 className="text-5xl font-extrabold font-headline tracking-tighter mb-4">Skillswap</h1>
                <p className="text-xl text-secondary leading-relaxed">Barter knowledge for free. Teach what you know, learn what you need.</p>
              </div>
              <Link 
                href="/skillswap/post"
                className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary/10 hover:-translate-y-0.5 transition-all active:scale-95 font-headline"
              >
                <span className="material-symbols-outlined">repeat</span>
                Post My Skills
              </Link>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
              {/* Marketplace Feed */}
              <section className="xl:col-span-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold font-headline text-on-surface">Available Skillswaps</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {offers.map((offer: any) => {
                    const descParts = offer.description?.split(' || ') || [];
                    return (
                      <div key={offer.id} className="bg-surface-container-lowest p-6 rounded-xl transition-all hover:shadow-xl hover:shadow-on-surface/5 flex flex-col gap-6 relative border border-outline-variant/10 group">
                        <div className="flex items-center gap-4">
                          <div className="relative w-14 h-14 shrink-0">
                            {offer.user_avatar && <Image alt={offer.user_name} fill className="rounded-full object-cover border-2 border-primary/20" src={offer.user_avatar} />}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-on-surface">{offer.user_name}</h3>
                            <p className="text-xs text-secondary font-medium flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span> {offer.user_rating} ★ Student Guru
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 font-headline">I can teach:</p>
                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">{offer.skill_have}</span>
                            <p className="text-[10px] text-secondary mt-1">{descParts[0]}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 font-headline">I want to learn:</p>
                            <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold border border-orange-100">{offer.skill_want}</span>
                            <p className="text-[10px] text-secondary mt-1">{descParts[1]}</p>
                          </div>
                        </div>
                        <Link 
                          href={`/skillswap/propose/${offer.id}`}
                          className="mt-4 w-full py-3 border border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all group-hover:shadow-md text-center block"
                        >
                          Propose Swap
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Side Panel */}
              <aside className="xl:col-span-4 space-y-8">
                {/* Swap Credits Card */}
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col gap-2 text-on-surface">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest font-headline">Swap Credits</p>
                    <span className="material-symbols-outlined text-sm text-secondary cursor-help">info</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-primary font-headline tracking-tighter">{user?.swap_credits || 0}</span>
                    <span className="text-sm font-bold text-primary font-headline">Units</span>
                  </div>
                  <p className="text-[10px] text-secondary font-medium">Earn 5 units by purchasing a paid Gig session.</p>
                </div>

                <div className="bg-surface-container-low p-8 rounded-2xl text-on-surface">
                  <h2 className="text-2xl font-bold font-headline text-on-surface mb-8">Active Conversations</h2>
                  
                  {/* Incoming Requests */}
                  {incomingRequests.length > 0 && (
                    <div className="mb-10">
                      <h3 className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-4 flex items-center gap-2 font-headline">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        Incoming Requests
                      </h3>
                      <div className="space-y-4">
                        {incomingRequests.map((r: any) => (
                          <div key={r.id} className="bg-surface-container-lowest p-5 rounded-xl border-l-4 border-primary shadow-sm space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 shrink-0">
                                {r.initiator_avatar && <Image alt={r.initiator_name} fill className="rounded-full object-cover" src={r.initiator_avatar} />}
                              </div>
                              <div>
                                <p className="font-bold text-sm">{r.initiator_name}</p>
                                <p className="text-[10px] text-secondary">Proposes <span className="text-primary font-bold">{r.offer_skill_have}</span></p>
                                {r.initiator_slot_choice && (
                                  <p className="text-[10px] text-secondary mt-1">Requested slot: <span className="text-on-surface font-bold">{r.initiator_slot_choice}</span></p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleRequestAction(r.id, 'accept')} className="flex-1 bg-primary text-white py-2 rounded-lg text-xs font-bold hover:brightness-110 shadow-sm transition-all active:scale-95">Accept</button>
                              <button onClick={() => handleRequestAction(r.id, 'decline')} className="flex-1 bg-surface-container-high text-secondary py-2 rounded-lg text-xs font-bold hover:bg-secondary-container transition-all active:scale-95">Decline</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active Scheduling / Negotiations */}
                  {activeNegotiations.length > 0 && (
                    <div>
                      <h3 className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-4 font-headline">My Swaps</h3>
                      <div className="space-y-4">
                        {activeNegotiations.map((r: any) => {
                          const isOtherSide = r.initiator_id !== user?.id;
                          const otherName = isOtherSide ? r.initiator_name : r.receiver_name;
                          const otherAvatar = isOtherSide ? r.initiator_avatar : r.receiver_avatar;

                          return (
                            <div key={r.id} className="bg-surface-container-lowest p-5 rounded-xl shadow-sm space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-10 h-10 shrink-0">
                                    {otherAvatar && <Image alt={otherName} fill className="rounded-full object-cover" src={otherAvatar} />}
                                  </div>
                                  <div>
                                    <p className="font-bold text-sm">{otherName}</p>
                                    <p className="text-[10px] text-secondary">
                                      {r.status === 'scheduled' ? 'Meeting Confirmed' : 'Matched - Negotiation'}
                                    </p>
                                  </div>
                                </div>
                                <div className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-tighter ${r.status === 'scheduled' ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'}`}>
                                  {r.status}
                                </div>
                              </div>
                              
                              {r.status === 'scheduled' ? (
                                <a 
                                  href={r.meet_link} 
                                  target="_blank"
                                  className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 hover:bg-green-700 transition-all active:scale-95"
                                >
                                  <span className="material-symbols-outlined text-sm">video_call</span>
                                  Join Meeting
                                </a>
                              ) : (
                                <button 
                                  onClick={() => setSchedulingRequest(r)}
                                  className="w-full py-2.5 border border-primary text-primary font-bold rounded-lg text-xs flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all active:scale-95"
                                >
                                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                                  Schedule Meeting
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>

      {/* Scheduling Modal */}
      {schedulingRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-black font-headline tracking-tighter">Schedule Swap</h2>
                <p className="text-secondary text-sm">Pick a time that works for both. Mutual opt-in required.</p>
              </div>
              <button 
                onClick={() => setSchedulingRequest(null)}
                className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {(schedulingRequest.proposed_slots?.length > 0 ? schedulingRequest.proposed_slots : [
                "Monday 10:00 AM", "Monday 02:00 PM", "Tuesday 11:00 AM", 
                "Wednesday 04:00 PM", "Thursday 09:30 AM", "Friday 03:00 PM"
              ]).map((slot: string) => {
                const myChoice = user?.id === schedulingRequest.initiator_id ? schedulingRequest.initiator_slot_choice : schedulingRequest.receiver_slot_choice;
                const otherChoice = user?.id === schedulingRequest.initiator_id ? schedulingRequest.receiver_slot_choice : schedulingRequest.initiator_slot_choice;
                
                const isMySelection = myChoice === slot;
                const isOtherSelection = otherChoice === slot;

                return (
                  <button 
                    key={slot}
                    onClick={() => handlePickSlot(schedulingRequest.id, slot)}
                    className={`relative p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${
                      isMySelection 
                        ? 'border-primary bg-primary/5' 
                        : 'border-outline-variant hover:border-primary/40'
                    }`}
                  >
                    <span className="font-bold text-sm">{slot}</span>
                    <div className="flex gap-1.5 mt-1">
                      {isMySelection && <span className="px-2 py-0.5 bg-primary text-white text-[9px] font-black uppercase rounded">You</span>}
                      {isOtherSelection && <span className="px-2 py-0.5 bg-secondary text-white text-[9px] font-black uppercase rounded">Partner</span>}
                    </div>
                    {isMySelection && isOtherSelection && (
                      <div className="absolute top-2 right-2 text-green-600">
                        <span className="material-symbols-outlined text-xl font-bold">check_circle</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-center text-secondary font-bold uppercase tracking-widest italic">
              * Choosing the same slot as your partner will finalize the meeting instantly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
