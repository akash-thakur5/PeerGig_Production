"use client";

import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SUBJECTS = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Business & Economics',
  'Architecture & Design',
  'Health & Medical Sciences',
  'Digital Arts',
  'Marketing',
  'Languages',
  'History & Humanities',
  'Other',
];

export default function CreateNewGigPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [topics, setTopics] = useState(['', '']);
  const [timingSlots, setTimingSlots] = useState([{ start: '10:00', end: '11:00' }]);

  const addTopic = () => setTopics([...topics, '']);
  const updateTopic = (i: number, val: string) => {
    const next = [...topics];
    next[i] = val;
    setTopics(next);
  };
  const removeTopic = (i: number) => setTopics(topics.filter((_, idx) => idx !== i));

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

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = topics.filter(Boolean);
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
    
    sessionStorage.setItem('peergig_gig_draft', JSON.stringify({
      title,
      description,
      subject,
      tags,
      timingSlots: validTimingSlots
    }));

    router.push('/tutor/create/pricing');
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body selection:bg-primary-container selection:text-on-primary-container">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-[#ffffff]/80 dark:bg-[#1b1b1e]/80 backdrop-blur-md shadow-[0_40px_40px_-15px_rgba(27,27,30,0.04)] flex justify-between items-center px-8 h-16 w-full">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-[#1b1b1e] dark:text-[#fbf8fc] font-headline">PeerGig</Link>
          <nav className="hidden md:flex gap-6 items-center">
            <Link className="font-headline tracking-tight text-[#5f5e61] hover:text-[#904d00] transition-colors px-3 py-1 rounded" href="/student">Explore</Link>
            <Link className="font-headline tracking-tight text-[#904d00] font-bold border-b-2 border-[#904d00] px-3 py-1" href="/tutor">Gigs</Link>
            <Link className="font-headline tracking-tight text-[#5f5e61] hover:text-[#904d00] transition-colors px-3 py-1 rounded" href="/connect">Community</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/tutor" className="px-4 py-2 text-sm font-semibold text-secondary hover:text-on-surface transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="flex min-h-screen pt-16">
        {/* SideNavBar */}
        <Sidebar />

        {/* Main Content Canvas */}
        <main className="flex-grow md:ml-64 p-8 bg-surface">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-12 text-on-surface">
              <h2 className="text-4xl font-extrabold font-headline tracking-tighter mb-2">Launch a New Gig</h2>
              <p className="text-secondary">Fill in the details below to publish your tutoring gig.</p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleContinue}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Section 1: Basic Information */}
                <div className="md:col-span-12 bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10 text-on-surface">
                  <div className="flex items-center gap-3 mb-8">
                    <span className="material-symbols-outlined text-primary">info</span>
                    <h3 className="text-xl font-bold font-headline">Basic Information</h3>
                  </div>
                  <div className="space-y-8">
                    <div className="relative">
                      <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2 px-1">Topic Title *</label>
                      <input
                        className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-3 transition-all placeholder:text-secondary/40 font-body text-lg outline-none"
                        placeholder="e.g. Master's Level Data Analysis with Python"
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    <div className="relative mb-6">
                      <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2 px-1">Subject Category *</label>
                      <select
                        className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-3 transition-all font-body appearance-none cursor-pointer outline-none"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      >
                        {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="relative">
                      <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2 px-1 text-on-surface">Detailed Description</label>
                      <textarea
                        className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:ring-0 focus:border-primary p-4 rounded-lg transition-all placeholder:text-secondary/40 font-body leading-relaxed outline-none"
                        placeholder="Explain the learning outcomes, prerequisites, and what makes this gig unique..."
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Topics Covered */}
                <div className="md:col-span-12 bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10 text-on-surface">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">list_alt</span>
                      <h3 className="text-xl font-bold font-headline">Topics Covered</h3>
                    </div>
                    <button type="button" onClick={addTopic} className="text-primary text-sm font-bold flex items-center gap-1 hover:underline group transition-all">
                      <span className="material-symbols-outlined text-sm group-hover:rotate-90 transition-transform">add</span>
                      Add topic
                    </button>
                  </div>
                  <div className="space-y-4">
                    {topics.map((topic, i) => (
                      <div key={i} className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl">
                        <span className="bg-white text-secondary font-bold text-xs w-6 h-6 flex items-center justify-center rounded-full border border-outline-variant">{i + 1}</span>
                        <input
                          className="flex-grow bg-transparent border-none focus:ring-0 font-body text-sm outline-none"
                          type="text"
                          placeholder="Type a topic (e.g. React Hooks, Dynamic Programming)..."
                          value={topic}
                          onChange={(e) => updateTopic(i, e.target.value)}
                        />
                        {topics.length > 1 && (
                          <button type="button" onClick={() => removeTopic(i)} className="text-error/40 hover:text-error transition-colors">
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 3: Timing Slots */}
                <div className="md:col-span-12 bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10 text-on-surface">
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
                  <div className="space-y-4">
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
              </div>

              {/* Action Footer */}
              <div className="mt-12 pt-8 border-t border-surface-container-high flex justify-between items-center text-on-surface">
                <Link href="/tutor" className="px-6 py-3 text-secondary font-bold hover:bg-surface-container-low rounded-xl transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined">arrow_back</span>
                  Back to Dashboard
                </Link>
                <button
                  type="submit"
                  className="bg-gradient-to-br from-[#904d00] to-[#ff8c00] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 shadow-lg hover:translate-y-[-2px] transition-all active:scale-95 group font-headline"
                >
                  Continue to Timing & Pricing
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
