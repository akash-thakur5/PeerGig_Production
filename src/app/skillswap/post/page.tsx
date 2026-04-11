"use client";

import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PostMySkillsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [skillHave, setSkillHave] = useState('');
  const [proficiency, setProficiency] = useState('Intermediate (Working Knowledge)');
  const [whatICover, setWhatICover] = useState('');
  
  const [skillWant, setSkillWant] = useState('');
  const [currentLevel, setCurrentLevel] = useState('Complete Beginner');
  const [whatINeed, setWhatINeed] = useState('');
  
  const [timeCommitment, setTimeCommitment] = useState('1-2 hours per week');
  const [timingSlots, setTimingSlots] = useState([{ start: '10:00', end: '11:00' }]);

  const addTimingSlot = () => setTimingSlots([...timingSlots, { start: '', end: '' }]);
  const updateTimingSlotStart = (i: number, val: string) => {
    const next = [...timingSlots];
    next[i].start = val;
    setTimingSlots(next);
  };
  const updateTimingSlotEnd = (i: number, val: string) => {
    const next = [...timingSlots];
    next[i].end = val;
    setTimingSlots(next);
  };
  const removeTimingSlot = (i: number) => setTimingSlots(timingSlots.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Modern "bundle" description as requested for the unified schema
    const description = `${proficiency} || ${currentLevel} || ${whatICover} || ${whatINeed} || ${timeCommitment}`;

    const validTimingSlots = timingSlots
      .filter(s => s.start && s.end)
      .map(s => {
        const formatTime = (time24: string) => {
          const [h, m] = time24.split(':');
          let hours = parseInt(h, 10);
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12 || 12;
          return `${hours}:${m} ${ampm}`;
        };
        return `${formatTime(s.start)} - ${formatTime(s.end)}`;
      });

    try {
      const res = await fetch('/api/skillswaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill_have: skillHave,
          skill_want: skillWant,
          description,
          timing_slots: validTimingSlots
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to post skill swap');
        return;
      }

      router.push('/skillswap');
      router.refresh();
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body selection:bg-primary-container selection:text-on-primary-container">
      {/* TopNavBar */}
      <header className="w-full sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl shadow-sm shadow-zinc-900/5 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black tracking-tight text-primary dark:text-primary-container font-headline">PeerGig</Link>
          <div className="hidden md:flex items-center gap-6 font-headline text-zinc-900 dark:text-zinc-100">
            <Link className="text-zinc-500 hover:text-zinc-800 transition-colors" href="/dashboard">Dashboard</Link>
            <Link className="text-primary border-b-2 border-primary pb-1" href="/skillswap">Skillswap</Link>
            <Link className="text-zinc-500 hover:text-zinc-800 transition-colors" href="/connect">Peer Connect</Link>
          </div>
        </div>
      </header>

      <div className="flex">
        <Sidebar />

        <main className="flex-1 md:ml-64 p-8 min-h-screen">
          <div className="max-w-5xl mx-auto mb-10">
            <Link className="inline-flex items-center text-secondary hover:text-primary transition-colors mb-4 text-sm font-medium" href="/skillswap">
              <span className="material-symbols-outlined text-base mr-1">arrow_back</span>
              Back to Skillswap
            </Link>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="text-on-surface">
                <h1 className="text-4xl font-headline font-extrabold tracking-tight">Create a Skillswap Request</h1>
                <p className="text-secondary mt-2 text-lg">Knowledge exchange is the currency of growth. Offer what you know, learn what you need.</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="max-w-5xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="max-w-5xl mx-auto bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden lg:block">
                <div className="w-12 h-12 bg-white rounded-full shadow-lg border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl font-bold">sync_alt</span>
                </div>
              </div>

              {/* Column A: What I Can Teach */}
              <div className="p-8 md:p-10 bg-surface-container-low border-r border-outline-variant/10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">school</span>
                  </div>
                  <h2 className="text-xl font-headline font-bold text-on-surface">I Can Teach...</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[0.6875rem] font-bold text-secondary uppercase tracking-widest mb-2 ml-1 font-headline">Topic / Skill *</label>
                    <input 
                      required
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-3 transition-all placeholder:text-zinc-400 outline-none font-body text-on-surface" 
                      placeholder="e.g. Advanced UI Design" 
                      type="text" 
                      value={skillHave}
                      onChange={(e) => setSkillHave(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[0.6875rem] font-bold text-secondary uppercase tracking-widest mb-2 ml-1 font-headline">Proficiency</label>
                    <select 
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-3 transition-all font-body text-on-surface outline-none cursor-pointer"
                      value={proficiency}
                      onChange={(e) => setProficiency(e.target.value)}
                    >
                      <option>Intermediate (Working Knowledge)</option>
                      <option>Advanced (Industry Pro)</option>
                      <option>Expert (Senior/Lead)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[0.6875rem] font-bold text-secondary uppercase tracking-widest mb-2 ml-1 font-headline">What I'll cover</label>
                    <textarea 
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-3 transition-all resize-none placeholder:text-zinc-400 outline-none font-body text-on-surface" 
                      placeholder="Detail the specific concepts or tools you can mentor someone in..." 
                      rows={4}
                      value={whatICover}
                      onChange={(e) => setWhatICover(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Column B: What I Want To Learn */}
              <div className="p-8 md:p-10 bg-white">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">book</span>
                  </div>
                  <h2 className="text-xl font-headline font-bold text-on-surface">I Want To Learn...</h2>
                </div>
                <div className="space-y-6 text-on-surface">
                  <div>
                    <label className="block text-[0.6875rem] font-bold text-secondary uppercase tracking-widest mb-2 ml-1 font-headline">Topic / Skill *</label>
                    <input 
                      required
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-3 transition-all placeholder:text-zinc-400 outline-none font-body" 
                      placeholder="e.g. Solidity Smart Contracts" 
                      type="text" 
                      value={skillWant}
                      onChange={(e) => setSkillWant(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[0.6875rem] font-bold text-secondary uppercase tracking-widest mb-2 ml-1 font-headline">Current Level</label>
                    <select 
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-3 transition-all font-body outline-none cursor-pointer"
                      value={currentLevel}
                      onChange={(e) => setCurrentLevel(e.target.value)}
                    >
                      <option>Complete Beginner</option>
                      <option>Casual Knowledge</option>
                      <option>Looking to Master</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[0.6875rem] font-bold text-secondary uppercase tracking-widest mb-2 ml-1 font-headline">What I need help with</label>
                    <textarea 
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-3 transition-all resize-none placeholder:text-zinc-400 outline-none font-body" 
                      placeholder="Be specific about your learning goals or roadblocks..." 
                      rows={4}
                      value={whatINeed}
                      onChange={(e) => setWhatINeed(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-10 bg-zinc-50/50 border-t border-outline-variant/10 text-on-surface">
              <div className="max-w-md">
                <label className="block text-[0.6875rem] font-bold text-secondary uppercase tracking-widest mb-2 ml-1 font-headline">Expected Time Commitment</label>
                <select 
                  className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-3 transition-all font-body outline-none cursor-pointer"
                  value={timeCommitment}
                  onChange={(e) => setTimeCommitment(e.target.value)}
                >
                  <option>1-2 hours per week</option>
                  <option>3-5 hours per week</option>
                  <option>Flexible / Project Based</option>
                  <option>One-time deep dive</option>
                </select>
              </div>
            </div>

            <div className="p-8 md:p-10 bg-white border-t border-outline-variant/10 text-on-surface">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">schedule</span>
                  <h3 className="text-xl font-bold font-headline">Available Timing Slots</h3>
                </div>
                <button type="button" onClick={addTimingSlot} className="text-primary text-sm font-bold flex items-center gap-1 hover:underline group transition-all">
                  <span className="material-symbols-outlined text-sm group-hover:rotate-90 transition-transform">add</span>
                  Add slot
                </button>
              </div>
              <div className="space-y-4 max-w-2xl">
                {timingSlots.map((slot, i) => (
                  <div key={i} className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl">
                    <span className="bg-white text-secondary font-bold text-xs w-6 h-6 flex items-center justify-center rounded-full border border-outline-variant shrink-0">{i + 1}</span>
                    <div className="flex-grow flex items-center gap-3">
                      <input
                        className="bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 font-body text-sm outline-none px-1 py-2 w-full"
                        type="time"
                        value={slot.start}
                        onChange={(e) => updateTimingSlotStart(i, e.target.value)}
                        required
                      />
                      <span className="text-secondary font-bold text-sm">to</span>
                      <input
                        className="bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 font-body text-sm outline-none px-1 py-2 w-full"
                        type="time"
                        value={slot.end}
                        onChange={(e) => updateTimingSlotEnd(i, e.target.value)}
                        required
                      />
                    </div>
                    {timingSlots.length > 1 && (
                      <button type="button" onClick={() => removeTimingSlot(i)} className="text-error/40 hover:text-error transition-colors shrink-0">
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="px-8 md:px-10 py-6 border-t border-outline-variant/10 flex items-center justify-between">
              <p className="text-xs text-secondary font-medium hidden md:block font-body">
                By posting, you agree to respond to swap requests within 48 hours.
              </p>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Link href="/skillswap" className="px-6 py-3 text-secondary font-bold hover:text-on-surface transition-colors font-body">
                  Cancel
                </Link>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 md:flex-none px-8 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:scale-95 transition-all font-headline disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-lg">repeat</span>
                  {loading ? 'Posting...' : 'Post Swap Gig'}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
