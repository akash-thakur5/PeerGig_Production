"use client";

import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CldUploadWidget } from 'next-cloudinary';

export default function PricingMaterialsPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<any>(null);
  
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('45 mins');
  const [level, setLevel] = useState('Intermediate');
  const [language, setLanguage] = useState('English');
  
  const [notesUrl, setNotesUrl] = useState('');
  const [testSolutionsUrl, setTestSolutionsUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('peergig_gig_draft');
    if (!saved) {
      router.push('/tutor/create');
    } else {
      setDraft(JSON.parse(saved));
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    
    setError('');
    setLoading(true);

    // Merge duration and level into tags since DB only has tags
    const combinedTags = [...(draft.tags || []), `Level: ${level}`, `Time: ${duration}`];

    try {
      const res = await fetch('/api/gigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draft.title,
          description: draft.description,
          subject: draft.subject,
          price_per_session: parseFloat(price),
          tags: combinedTags,
          timing_slots: draft.timingSlots,
          language: language,
          notes_url: notesUrl,
          test_solutions_url: testSolutionsUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Failed to create gig');
        return;
      }

      sessionStorage.removeItem('peergig_gig_draft');
      router.push('/tutor');
      router.refresh();
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  if (!draft) return null; // Wait for draft check

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
      </header>

      {/* SideNavBar */}
      <Sidebar />

      {/* Main Content */}
      <main className="md:ml-64 pt-16 min-h-screen bg-surface">
        <div className="max-w-5xl mx-auto p-8 lg:p-12">
            {/* Hero Header & Progress */}
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-5xl font-extrabold tracking-tighter mb-4 leading-none font-headline">Finalize Your <span className="text-primary italic">PeerGig</span></h1>
                    <p className="text-secondary max-w-md text-lg leading-relaxed font-body">Define your value proposition through competitive pricing and premium study materials.</p>
                </div>
                <div className="flex flex-col items-end gap-3 text-on-surface">
                    <div className="flex gap-2">
                        <div className="h-1 w-12 bg-primary rounded-full"></div>
                        <div className="h-1 w-12 bg-primary rounded-full"></div>
                    </div>
                    <div className="text-right">
                        <span className="block text-xs font-bold uppercase tracking-widest text-primary font-body">Step 2 of 2: Pricing &amp; Materials</span>
                        <span className="text-sm text-secondary font-body">Step 1: Basic Info (Completed)</span>
                    </div>
                </div>
            </div>

            {error && (
              <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-12 text-on-surface">
                {/* Section 3: Pricing & Details */}
                <section className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10">
                    <div className="flex items-center gap-4 mb-8">
                        <span className="material-symbols-outlined text-primary text-3xl">payments</span>
                        <h2 className="text-2xl font-bold tracking-tight font-headline">Pricing &amp; Details</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Price Input */}
                        <div className="group">
                            <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2 group-focus-within:text-primary transition-colors font-body">Price per Session *</label>
                            <div className="relative">
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-lg font-bold text-on-surface/50">₹</span>
                                <input 
                                  className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary outline-none py-3 pl-6 text-xl font-bold transition-all placeholder:text-on-surface/20 font-body" 
                                  placeholder="0.00" 
                                  type="number"
                                  min="1"
                                  step="1"
                                  required
                                  value={price}
                                  onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>
                        </div>
                        {/* Language Dropdown */}
                        <div className="group">
                            <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2 group-focus-within:text-primary transition-colors font-body">Language</label>
                            <div className="relative">
                                <select 
                                  className="w-full appearance-none bg-transparent border-b-2 border-outline-variant focus:border-primary outline-none py-3 text-xl font-bold transition-all cursor-pointer font-body"
                                  value={language}
                                  onChange={(e) => setLanguage(e.target.value)}
                                >
                                    <option value="English">English</option>
                                    <option value="Hindi">Hindi</option>
                                    <option value="Spanish">Spanish</option>
                                    <option value="French">French</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                            </div>
                        </div>
                        {/* Duration Dropdown */}
                        <div className="group">
                            <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2 group-focus-within:text-primary transition-colors font-body">Duration</label>
                            <div className="relative">
                                <select 
                                  className="w-full appearance-none bg-transparent border-b-2 border-outline-variant focus:border-primary outline-none py-3 text-xl font-bold transition-all cursor-pointer font-body"
                                  value={duration}
                                  onChange={(e) => setDuration(e.target.value)}
                                >
                                    <option value="30 mins">30 mins</option>
                                    <option value="45 mins">45 mins</option>
                                    <option value="60 mins">60 mins</option>
                                    <option value="90 mins">90 mins</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                            </div>
                        </div>
                        {/* Level Dropdown */}
                        <div className="group">
                            <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2 group-focus-within:text-primary transition-colors font-body">Level</label>
                            <div className="relative">
                                <select 
                                  className="w-full appearance-none bg-transparent border-b-2 border-outline-variant focus:border-primary outline-none py-3 text-xl font-bold transition-all cursor-pointer font-body"
                                  value={level}
                                  onChange={(e) => setLevel(e.target.value)}
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                    <option value="Masters">Masters</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 4 & 5: Study Materials & Assessment (Asymmetric Grid) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Section 4: Study Materials */}
                    <section className="bg-surface-container-lowest rounded-3xl p-8 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-outline-variant/10 flex flex-col">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="material-symbols-outlined text-primary text-3xl">auto_stories</span>
                            <h2 className="text-2xl font-bold tracking-tight font-headline">Study Materials</h2>
                        </div>
                        <div className="mb-6 p-4 bg-surface-container-low rounded-xl">
                            <p className="text-sm font-medium mb-3 font-body">Provide Notes for students?</p>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input 
                                      defaultChecked 
                                      className="w-4 h-4 text-primary focus:ring-primary border-outline-variant" 
                                      name="notes" 
                                      type="radio" 
                                    />
                                    <span className="text-sm font-semibold group-hover:text-primary transition-colors font-body text-on-surface">Yes, include them</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input 
                                      className="w-4 h-4 text-primary focus:ring-primary border-outline-variant" 
                                      name="notes" 
                                      type="radio" 
                                    />
                                    <span className="text-sm font-semibold group-hover:text-primary transition-colors font-body text-on-surface">No</span>
                                </label>
                            </div>
                        </div>
                        {/* Dropzone */}
                        <CldUploadWidget 
                          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "app_uploads"}
                          options={{ sources: ['local', 'url'], multiple: false, clientAllowedFormats: ['png', 'jpg', 'jpeg', 'pdf', 'doc', 'docx'], resourceType: 'auto' }}
                          onSuccess={(result: any) => {
                            if (result?.info?.secure_url) {
                              setNotesUrl(result.info.secure_url);
                            }
                          }}
                        >
                          {({ open }) => (
                            <div onClick={() => open()} className="flex-1 border-2 border-dashed border-outline-variant/40 rounded-2xl flex flex-col items-center justify-center p-8 hover:border-primary/50 transition-colors bg-surface-container-low/30 cursor-pointer">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-primary text-2xl">cloud_upload</span>
                                </div>
                                <p className="font-bold text-center font-body text-on-surface">
                                  {notesUrl ? 'Notes Attached Successfully!' : 'Click to upload your notes'}
                                </p>
                                <p className="text-xs text-secondary mt-1 font-body">PDF, DOCX up to 20MB</p>
                            </div>
                          )}
                        </CldUploadWidget>
                    </section>

                    {/* Section 5: Assessment */}
                    <section className="bg-surface-container-lowest rounded-3xl p-8 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-outline-variant/10">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="material-symbols-outlined text-primary text-3xl">assignment</span>
                            <h2 className="text-2xl font-bold tracking-tight font-headline">Assessment</h2>
                        </div>
                        <div className="mb-6 p-4 bg-surface-container-low rounded-xl">
                            <p className="text-sm font-medium mb-3 font-body text-on-surface">Provide test questions?</p>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input 
                                      defaultChecked 
                                      className="w-4 h-4 text-primary focus:ring-primary border-outline-variant" 
                                      name="test" 
                                      type="radio" 
                                    />
                                    <span className="text-sm font-semibold group-hover:text-primary transition-colors font-body text-on-surface">Yes</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input 
                                      className="w-4 h-4 text-primary focus:ring-primary border-outline-variant" 
                                      name="test" 
                                      type="radio" 
                                    />
                                    <span className="text-sm font-semibold group-hover:text-primary transition-colors font-body text-on-surface">No</span>
                                </label>
                            </div>
                        </div>
                        <div className="space-y-4 mb-6">
                            <input 
                              className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-body text-on-surface" 
                              placeholder="Enter question 1" 
                              type="text" 
                            />
                            <input 
                              className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-body text-on-surface" 
                              placeholder="Enter question 2" 
                              type="text" 
                            />
                            <button type="button" className="text-xs font-bold text-primary flex items-center gap-1 hover:opacity-80 transition-opacity font-body">
                                <span className="material-symbols-outlined text-sm">add_circle</span>
                                Add another question
                            </button>
                        </div>
                        {/* Mini Dropzone */}
                        <CldUploadWidget 
                          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "app_uploads"}
                          options={{ sources: ['local', 'url'], multiple: false, clientAllowedFormats: ['png', 'jpg', 'jpeg', 'pdf', 'doc', 'docx'], resourceType: 'auto' }}
                          onSuccess={(result: any) => {
                            if (result?.info?.secure_url) {
                              setTestSolutionsUrl(result.info.secure_url);
                            }
                          }}
                        >
                          {({ open }) => (
                            <div onClick={() => open()} className="border-2 border-dashed border-outline-variant/40 rounded-xl flex items-center gap-4 p-4 hover:border-primary/50 transition-colors bg-surface-container-low/30 cursor-pointer">
                                <div className="w-10 h-10 bg-on-tertiary-container/10 rounded-full flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-tertiary text-xl">fact_check</span>
                                </div>
                                <div className="text-on-surface">
                                    <p className="text-sm font-bold font-body">{testSolutionsUrl ? 'Solutions Attached!' : 'Upload Solutions'}</p>
                                    <p className="text-[10px] text-secondary font-body">Correct answers for verification</p>
                                </div>
                            </div>
                          )}
                        </CldUploadWidget>
                    </section>
                </div>

                {/* Action Footer */}
                <footer className="flex items-center justify-between pt-8 border-t border-outline-variant/15 text-on-surface">
                    <Link 
                      href="/tutor/create" 
                      className="px-8 py-3 rounded-full border border-outline/30 text-secondary font-bold hover:bg-surface-container-low transition-all flex items-center gap-2 font-body"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span>
                      Back
                    </Link>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="px-10 py-4 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-extrabold shadow-[0_10px_20px_-5px_rgba(144,77,0,0.4)] hover:-translate-y-1 transition-all flex items-center gap-3 font-headline disabled:opacity-60 disabled:translate-y-0"
                    >
                        {loading ? 'Launching...' : 'Launch Gig'}
                        <span className="material-symbols-outlined text-lg">rocket_launch</span>
                    </button>
                </footer>
            </form>
        </div>
      </main>

      {/* Visual Accents */}
      <div className="fixed bottom-0 right-0 p-8 pointer-events-none opacity-10">
        <span className="material-symbols-outlined text-[300px]">school</span>
      </div>
    </div>
  );
}
