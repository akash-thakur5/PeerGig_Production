"use client";

import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import TopNavBar from '@/components/TopNavBar';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatar_url: ''
  });

  useEffect(() => {
    fetch('/api/users/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          setFormData({
            name: data.user.name || '',
            bio: data.user.bio || '',
            avatar_url: data.user.avatar_url || ''
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch profile:', err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setSaving(false);
      // Clear message after 3s
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body selection:bg-primary-container selection:text-white">
      {/* TopNavBar */}
      <TopNavBar />

      <div className="flex pt-16">
        {/* Side Navigation Bar (Desktop) */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="lg:ml-64 flex-1 bg-gray-50 min-h-screen p-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Identity Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-zinc-100 p-8 flex flex-col items-center text-center sticky top-24">
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md relative group">
                    <Image 
                      alt={user?.name || 'User'} 
                      fill
                      className="object-cover" 
                      src={user?.avatar_url || 'https://lh3.googleusercontent.com/a/default-user'} 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                       <span className="material-symbols-outlined text-white">photo_camera</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2 font-headline">{user?.name}</h3>
                <div className="inline-flex items-center px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[11px] font-bold tracking-wider uppercase font-inter">
                  <span className="material-symbols-outlined text-[14px] mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  Verified Scholar
                </div>
                
                <div className="w-full mt-8 pt-8 border-t border-zinc-50 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-on-surface">{user?.active_gigs || 0}</div>
                    <div className="text-[10px] text-secondary uppercase font-bold tracking-widest">Active Gigs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-on-surface">₹{(user?.total_earned || 0).toLocaleString()}</div>
                    <div className="text-[10px] text-secondary uppercase font-bold tracking-widest">Earned</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Profile Settings Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden relative">
                
                {/* Visual Feedback Message */}
                {message && (
                  <div className={`absolute top-0 left-0 right-0 p-3 text-center text-xs font-bold ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'} transition-all z-20`}>
                    {message.text}
                  </div>
                )}

                <div className="p-8 pb-4">
                  <h2 className="text-2xl font-bold text-zinc-900 tracking-tight font-headline">My Profile</h2>
                  <p className="text-secondary text-sm mt-1 font-inter">Update your information to stand out in the community.</p>
                </div>

                <form onSubmit={handleSave} className="p-8 space-y-10">
                  {/* Section: Personal Details */}
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="h-1 w-8 bg-primary rounded-full"></div>
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 font-inter">Personal Details</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-1.5 font-inter">
                        <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider ml-1">Full Name</label>
                        <input 
                          className="w-full bg-surface-container-low border-b border-outline-variant focus:border-primary focus:ring-0 px-4 py-3 text-on-surface rounded-t-lg transition-colors outline-none" 
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1.5 font-inter">
                        <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider ml-1">Email (Primary)</label>
                        <input 
                          className="w-full bg-surface-container-low border-b border-outline-variant px-4 py-3 text-secondary rounded-t-lg transition-colors outline-none cursor-not-allowed opacity-70" 
                          type="email" 
                          value={user?.email}
                          readOnly
                        />
                      </div>
                      <div className="space-y-1.5 font-inter">
                        <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider ml-1">Avatar Image URL</label>
                        <input 
                          className="w-full bg-surface-container-low border-b border-outline-variant focus:border-primary focus:ring-0 px-4 py-3 text-on-surface rounded-t-lg transition-colors outline-none" 
                          type="text" 
                          value={formData.avatar_url}
                          onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                        />
                      </div>
                    </div>
                  </section>

                  {/* Section: About Me */}
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="h-1 w-8 bg-primary rounded-full"></div>
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 font-inter">About Me</h4>
                    </div>
                    <div className="space-y-1.5 font-inter">
                      <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider ml-1">Bio</label>
                      <textarea 
                        className="w-full bg-surface-container-low border-b border-outline-variant focus:border-primary focus:ring-0 px-4 py-3 text-on-surface rounded-t-lg transition-colors resize-none min-h-[120px] outline-none" 
                        placeholder="Tell the community about your skills and interests..." 
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      ></textarea>
                    </div>
                  </section>

                  <div className="flex justify-end items-center gap-6 pt-4">
                    <button 
                      type="button"
                      onClick={() => setFormData({ name: user?.name, bio: user?.bio, avatar_url: user?.avatar_url })}
                      className="text-zinc-500 font-bold text-sm hover:text-zinc-900 transition-colors uppercase tracking-widest font-inter"
                    >
                      Reset
                    </button>
                    <button 
                      type="submit"
                      disabled={saving}
                      className={`bg-gradient-to-br from-primary to-primary-container text-white px-10 py-4 rounded-xl font-bold text-sm shadow-lg shadow-orange-600/10 hover:-translate-y-0.5 active:translate-y-0 transition-all uppercase tracking-widest font-inter flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Nav (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-zinc-100 flex justify-around items-center py-3 z-50">
        <Link className="flex flex-col items-center text-zinc-400" href="/dashboard">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link className="flex flex-col items-center text-zinc-400" href="/skillswap">
          <span className="material-symbols-outlined">swap_horiz</span>
          <span className="text-[10px] font-medium">Swap</span>
        </Link>
        <Link className="flex flex-col items-center text-orange-600" href="/profile">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-bold">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
