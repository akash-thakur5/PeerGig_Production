"use client";

import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

export default function ProposeSwapPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [offer, setOffer] = useState<any>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Proposal State
  const [initiatorSkillOffered, setInitiatorSkillOffered] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch the specific offer
        const resOffer = await fetch('/api/skillswaps');
        const dataOffer = await resOffer.json();
        const found = dataOffer.offers?.find((o: any) => o.id.toString() === id);
        
        if (!found) {
          setError('Offer not found');
        } else {
          setOffer(found);
        }

        // 2. Fetch my user credits
        const resUser = await fetch('/api/users/me');
        const dataUser = await resUser.json();
        setUserCredits(dataUser.user?.swap_credits || 0);

      } catch (err) {
        setError('Failed to load swap details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handlePropose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userCredits < 10) {
      setError('You need at least 10 Swap Credits to propose a trade.');
      return;
    }
    
    setError('');
    setSubmitting(true);

    try {
      let finalDateTime = null;
      if (selectedDate && selectedSlot) {
        finalDateTime = `${selectedDate} | ${selectedSlot}`;
      } else if (offer?.timing_slots && offer.timing_slots.length > 0) {
        setError('Please select a date and an available timing slot');
        setSubmitting(false);
        return;
      }

      const res = await fetch('/api/skillswaps/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill_offer_id: parseInt(id as string),
          initiator_skill_offered: initiatorSkillOffered,
          initiator_slot_choice: finalDateTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to propose swap');
        return;
      }

      router.push('/skillswap');
      router.refresh();
    } catch {
      setError('Network error — please try again');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center font-headline">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">sync</span>
          <p className="mt-4 text-secondary">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center p-8 bg-surface-container-low rounded-2xl shadow-sm border border-outline-variant/10">
          <span className="material-symbols-outlined text-5xl text-secondary mb-4">search_off</span>
          <h2 className="text-2xl font-bold font-headline mb-4">Swap not found</h2>
          <Link href="/skillswap" className="text-primary font-bold hover:underline">Back to Skillswap Marketplace</Link>
        </div>
      </div>
    );
  }

  // Parse the "bundle" description we have in DB
  const descParts = offer.description?.split(' || ') || [];
  const proficiency = descParts[0] || 'N/A';
  const currentLevel = descParts[1] || 'N/A';
  const teacherDetails = descParts[2] || '';
  const learnerDetails = descParts[3] || '';
  const timeCommitment = descParts[4] || '1-2 hours per week';

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body selection:bg-primary-container selection:text-on-primary-container">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between px-8 h-16 w-full shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-2xl font-black tracking-tighter text-primary font-headline">PeerGig</Link>
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row min-h-screen pt-16">
        <Sidebar />

        <main className="flex-grow pt-8 pb-12 px-6 lg:ml-64 max-w-7xl mx-auto">
          <header className="mb-8 font-body">
            <Link className="group flex items-center gap-2 text-secondary font-medium text-sm hover:text-primary transition-colors" href="/skillswap">
              <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
              Back to Skillswap Marketplace
            </Link>
          </header>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-12 font-body">
            {/* Left Column */}
            <section className="lg:w-[70%]">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight mb-10 text-on-surface font-headline">
                Propose Swap: {offer.skill_have} for <span className="text-primary">{offer.skill_want}</span>
              </h1>
              
              <div className="bg-surface-container-low p-8 rounded-2xl mb-6 relative overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-primary">
                    <span className="material-symbols-outlined text-3xl">school</span>
                  </div>
                  <div>
                    <span className="text-[0.6875rem] font-bold tracking-widest text-primary uppercase mb-1 block">The Expertise</span>
                    <h2 className="text-xl font-bold mb-3 font-headline text-on-surface">They can teach: {offer.skill_have} | <span className="text-secondary font-medium text-sm font-body">{proficiency}</span></h2>
                    <p className="text-secondary leading-relaxed max-w-2xl">{teacherDetails}</p>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/20 mb-10">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-surface-container-low rounded-xl text-secondary">
                    <span className="material-symbols-outlined text-3xl">book_5</span>
                  </div>
                  <div>
                    <span className="text-[0.6875rem] font-bold tracking-widest text-secondary uppercase mb-1 block">What they want in return</span>
                    <h2 className="text-xl font-bold mb-3 font-headline text-on-surface">They want to learn: {offer.skill_want} | <span className="text-secondary font-medium text-sm font-body">{currentLevel}</span></h2>
                    <p className="text-secondary leading-relaxed max-w-2xl">{learnerDetails}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-surface-container-low/50 rounded-xl mb-12 border-l-4 border-primary">
                <span className="material-symbols-outlined text-primary">schedule</span>
                <span className="font-medium text-on-surface">Expected Commitment: <span className="font-bold text-primary">{timeCommitment}</span></span>
              </div>

              <form onSubmit={handlePropose} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-on-surface uppercase tracking-widest mb-4 font-headline">What can you offer {offer.user_name.split(' ')[0]} in return? *</label>
                  <textarea 
                    required
                    className="w-full bg-surface-container-lowest border-2 border-outline-variant focus:border-primary p-6 rounded-2xl transition-all font-body text-on-surface text-lg outline-none resize-none"
                    placeholder={`Mention how you can teach ${offer.skill_want} or related skills...`}
                    rows={4}
                    value={initiatorSkillOffered}
                    onChange={(e) => setInitiatorSkillOffered(e.target.value)}
                  />
                  <p className="text-xs text-secondary mt-3">Be as specific as possible to increase your chances of acceptance.</p>
                </div>

                {offer.timing_slots && offer.timing_slots.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest font-headline">Choose Preferred Slot *</h3>
                      <span className="text-[10px] font-bold text-secondary bg-surface-container-low px-2 py-1 rounded-full uppercase tracking-tighter">
                        {offer.user_name.split(' ')[0]}'s Available Times
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/50 p-4 rounded-2xl border border-outline-variant/10">
                        <label className="block text-[0.6875rem] font-bold text-secondary uppercase tracking-widest mb-3 ml-1 font-headline">1. Select Date</label>
                        <input
                          type="date"
                          required
                          className="w-full bg-white border-2 border-outline-variant focus:border-primary p-4 rounded-xl transition-all font-body text-sm outline-none shadow-sm"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                        />
                      </div>
                      
                      <div className="bg-white/50 p-4 rounded-2xl border border-outline-variant/10">
                        <label className="block text-[0.6875rem] font-bold text-secondary uppercase tracking-widest mb-3 ml-1 font-headline">2. Pick an Available Slot</label>
                        <div className="grid grid-cols-1 gap-2">
                          {offer.timing_slots.map((slot: string, idx: number) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                                selectedSlot === slot 
                                  ? 'border-primary bg-primary/5 ring-4 ring-primary/10' 
                                  : 'border-outline-variant bg-white hover:border-primary/40'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`material-symbols-outlined text-lg ${selectedSlot === slot ? 'text-primary' : 'text-secondary'}`}>
                                  {selectedSlot === slot ? 'radio_button_checked' : 'radio_button_unchecked'}
                                </span>
                                <span className={`font-bold text-sm ${selectedSlot === slot ? 'text-primary' : 'text-on-surface'}`}>{slot}</span>
                              </div>
                              {selectedSlot === slot && (
                                <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                              )}
                            </button>
                          ))}
                        </div>
                        {/* Hidden input to ensure form-level required validation if needed, or just rely on the button state */}
                        <input type="hidden" name="selectedSlot" value={selectedSlot} required />
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                      <span className="material-symbols-outlined">payments</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface uppercase tracking-tighter">Swap Proposal Cost</p>
                      <p className="text-xs text-secondary">Credited from your Swap Credit balance</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-primary tracking-tighter">10 Credits</p>
                    <p className={`text-[10px] font-bold ${userCredits >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                      {userCredits >= 10 ? `Available: ${userCredits} Units` : `Warning: Low Credits (${userCredits})`}
                    </p>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={submitting || (userCredits < 10)}
                  className="group flex items-center gap-3 px-10 py-5 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-lg hover:-translate-y-1 transition-all active:scale-95 duration-200 font-headline disabled:opacity-50 disabled:grayscale"
                >
                  <span className="material-symbols-outlined">repeat_on</span>
                  <span className="text-lg">{submitting ? 'Sending Proposal...' : 'Send Swap Proposal'}</span>
                  {!submitting && <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">send</span>}
                </button>
              </form>
            </section>

            {/* Right Column */}
            <aside className="lg:w-[30%]">
              <div className="sticky top-24">
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/20">
                  <div className="flex flex-col items-center text-center mb-8">
                    <div className="relative mb-4 w-24 h-24">
                      {offer.user_avatar && (
                        <Image 
                          alt={offer.user_name} 
                          fill
                          className="rounded-full object-cover border-4 border-surface-container-low shadow-sm" 
                          src={offer.user_avatar} 
                        />
                      )}
                      <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white"></div>
                    </div>
                    <h3 className="text-2xl font-bold mb-1 font-headline text-on-surface">{offer.user_name}</h3>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-low rounded-full">
                      <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                      <span className="text-xs font-bold text-on-surface-variant font-body">{offer.user_rating} ★ Student Guru</span>
                    </div>
                  </div>

                  <div className="border-t border-surface-container-high pt-6 font-body">
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-3 text-on-surface font-headline">Verification</h4>
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl text-green-800 text-xs font-bold border border-green-100">
                      <span className="material-symbols-outlined text-base">verified_user</span>
                      Account Verified
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
