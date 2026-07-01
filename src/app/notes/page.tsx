"use client";

import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import TopNavBar from '@/components/TopNavBar';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { CldUploadWidget } from 'next-cloudinary';

interface Note {
  id: number;
  title: string;
  subject: string;
  tutor_name: string | null;
  content_url: string | null;
  gig_id: number | null;
  user_id: number;
  created_at: string;
}

interface Gig {
  id: number;
  title: string;
}

export default function NotesDashboardPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [myGigs, setMyGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  // Tabs State
  const [activeTab, setActiveTab] = useState<'acquired' | 'personal'>('acquired');
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', subject: '', tutor_name: '', content_url: '', gig_id: '' });

  // Download Handler
  const handleDownload = async (url: string, filename: string) => {
    try {
      // Fetch the file, which bypasses the browser's native PDF viewer renderer
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      
      // Create a temporary object URL to force download
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      
      // Fallback: Just open in a new tab if blob fetching fails (e.g., due to CORS)
      window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(url)}`, '_blank');
    }
  };
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(d => { if (d.user) setCurrentUserId(d.user.id) });
    fetchNotes();
    fetchMyGigs();
  }, []);

  const fetchMyGigs = async () => {
    try {
      const res = await fetch('/api/gigs/mine');
      const data = await res.json();
      if (data.gigs) setMyGigs(data.gigs);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setNotes(data.notes || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setShowCreateModal(false);
      setNewNote({ title: '', subject: '', tutor_name: '', content_url: '', gig_id: '' });
      fetchNotes();
    } catch (err: any) {
      alert(err.message || 'Error creating notebook');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async (id: number) => {
    if (!confirm('Are you sure you want to delete this notebook?')) return;
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotes(notes.filter(n => n.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete note');
      }
    } catch (err) {
      alert('Error deleting note');
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary/20 min-h-screen">
      <TopNavBar />

      {/* Create Note Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-zinc-900">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold font-headline">New Personal Notebook</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-neutral-500 hover:text-neutral-900 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateNote} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 font-headline">Title</label>
                <input
                  type="text"
                  required
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="e.g. Advanced Thermodynamics"
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 font-headline">Subject</label>
                <input
                  type="text"
                  required
                  value={newNote.subject}
                  onChange={(e) => setNewNote({ ...newNote, subject: e.target.value })}
                  placeholder="e.g. Physics"
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 font-headline">Tutor Name (Optional)</label>
                <input
                  type="text"
                  value={newNote.tutor_name}
                  onChange={(e) => setNewNote({ ...newNote, tutor_name: e.target.value })}
                  placeholder="e.g. Alex M."
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all"
                />
              </div>
              {myGigs.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 font-headline">Attach to a Gig (Optional)</label>
                  <select
                    value={newNote.gig_id}
                    onChange={(e) => setNewNote({ ...newNote, gig_id: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-neutral-700"
                  >
                    <option value="">Do not attach (Personal Notebook)</option>
                    {myGigs.map(gig => (
                      <option key={gig.id} value={gig.id}>{gig.title}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 font-headline">Upload PDF or Image</label>
                <CldUploadWidget 
                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "app_uploads"}
                  options={{ sources: ['local', 'url'], multiple: false, clientAllowedFormats: ['png', 'jpg', 'jpeg', 'pdf', 'doc', 'docx'], resourceType: 'auto' }}
                  onSuccess={(result: any) => {
                    if (result?.info?.secure_url) {
                      setNewNote({ ...newNote, content_url: result.info.secure_url });
                    }
                  }}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      className="w-full px-4 py-3 bg-neutral-50 border border-dashed border-neutral-400 text-neutral-600 rounded-xl hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 font-semibold"
                    >
                      <span className="material-symbols-outlined">upload_file</span>
                      {newNote.content_url ? 'File Attached Successfully' : 'Choose File to Upload'}
                    </button>
                  )}
                </CldUploadWidget>
                {newNote.content_url && (
                  <p className="text-[10px] text-green-600 font-bold ml-1 flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                    File ready to be saved
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-md hover:translate-y-[-2px] transition-all disabled:opacity-60 font-headline uppercase tracking-widest"
              >
                {submitting ? 'Creating...' : 'Create Notebook'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex pt-16">
        <Sidebar />

        <main className="flex-1 lg:ml-64 p-8 md:p-12 max-w-7xl mx-auto min-h-screen pb-24">
          <header className="mb-12">
            <h1 className="text-5xl font-headline font-extrabold text-neutral-900 mb-4 tracking-tight">Study Hub</h1>
            <p className="text-lg text-neutral-500 max-w-2xl font-body leading-relaxed">
              Organize your learning materials, create notebooks, and generate study aids.
            </p>
          </header>

          <div className="flex items-center gap-10 mb-8 border-b border-neutral-100">
            <button 
              onClick={() => setActiveTab('acquired')}
              className={`pb-4 tracking-wide text-sm font-headline active:scale-95 transition-all ${activeTab === 'acquired' ? 'text-primary font-bold border-b-2 border-primary' : 'text-neutral-500 font-medium hover:text-neutral-900'}`}
            >
              Acquired Materials
            </button>
            <button 
              onClick={() => setActiveTab('personal')}
              className={`pb-4 tracking-wide text-sm font-headline active:scale-95 transition-all ${activeTab === 'personal' ? 'text-primary font-bold border-b-2 border-primary' : 'text-neutral-500 font-medium hover:text-neutral-900'}`}
            >
              Personal Notebooks
            </button>
          </div>

          {loading ? (
             <div className="flex items-center justify-center py-20">
               <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
             </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {notes
                .filter(note => activeTab === 'acquired' ? note.user_id !== currentUserId : note.user_id === currentUserId)
                .map((note) => (
                <article key={note.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-secondary/10 rounded-xl group-hover:scale-105 transition-transform duration-300">
                      <span className="material-symbols-outlined text-primary text-3xl">description</span>
                    </div>
                    {currentUserId === note.user_id ? (
                      <button onClick={() => handleDeleteNote(note.id)} className="text-neutral-400 hover:text-red-500 transition-colors" title="Delete Notebook">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    ) : (
                      <button className="text-neutral-400 hover:text-neutral-900">
                        <span className="material-symbols-outlined">more_horiz</span>
                      </button>
                    )}
                  </div>
                  <h3 className="text-lg font-bold font-headline mb-4 text-neutral-900">{note.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {note.tutor_name && <span className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-[10px] font-bold uppercase tracking-wider font-body">Tutor: {note.tutor_name}</span>}
                    <span className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-[10px] font-bold uppercase tracking-wider font-body">Subject: {note.subject}</span>
                    <span className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-[10px] font-bold uppercase tracking-wider font-body">Date: {new Date(note.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="mt-auto space-y-3">
                    <div className="flex gap-2">
                      {note.content_url ? (
                        <button 
                          onClick={() => handleDownload(note.content_url!, note.title.replace(/\s+/g, '_'))}
                          className="flex-1 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-50 flex items-center justify-center gap-2 transition-colors font-headline"
                        >
                          <span className="material-symbols-outlined text-base">download</span>
                          Download
                        </button>
                      ) : (
                        <button 
                          onClick={() => alert('No file attached')}
                          className="flex-1 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-50 flex items-center justify-center gap-2 transition-colors font-headline"
                        >
                          <span className="material-symbols-outlined text-base">download</span>
                          Download
                        </button>
                      )}
                      <button className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 text-neutral-600 transition-colors">
                        <span className="material-symbols-outlined text-base">share</span>
                      </button>
                    </div>
                    <button className="w-full py-2.5 border border-primary/20 text-primary font-bold rounded-lg text-xs hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 font-headline uppercase tracking-widest">
                      <span className="material-symbols-outlined text-base">auto_awesome</span>
                      Turn into Flashcards
                    </button>
                  </div>
                </article>
              ))}

              {activeTab === 'personal' && (
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="group relative bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5 transition-all font-headline"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-3xl">add</span>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-neutral-900">Create New Personal Notebook</p>
                    <p className="text-sm text-neutral-500 mt-1 font-body">Start drafting your own study guide</p>
                  </div>
                </button>
              )}
            </div>
          )}

          <section className="mt-16 bg-white rounded-2xl p-8 border border-neutral-100 shadow-sm">
            <h2 className="text-2xl font-headline font-bold mb-6 flex items-center gap-2 text-neutral-900">
              <span className="material-symbols-outlined text-primary">tips_and_updates</span>
              Study Tips for You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">auto_fix_high</span>
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 mb-1 font-headline">AI-Powered Flashcards</h4>
                  <p className="text-sm text-neutral-500 font-body leading-relaxed">
                    Our system can now automatically generate active recall questions from your uploaded PDF notes.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 mb-1 font-headline">Collaborative Study</h4>
                  <p className="text-sm text-neutral-500 font-body leading-relaxed">
                    Join the Peer Connect tab to find students who are currently studying the same materials as you.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
