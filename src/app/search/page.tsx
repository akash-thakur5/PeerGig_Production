"use client";

import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TopNavBar from '@/components/TopNavBar';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Gig {
  id: number;
  title: string;
  description: string;
  subject: string;
  price_per_session: string;
  tutor_name: string;
  tutor_avatar: string;
  tutor_rating: number;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    performSearch(initialQuery);
  }, [initialQuery]);

  const performSearch = async (searchTerm: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gigs?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data.gigs || []);
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <main className="lg:ml-64 w-full min-h-screen px-6 lg:px-12 py-12">
      {/* Search Header Section */}
      <section className="max-w-5xl mb-12">
        <form onSubmit={handleSearchSubmit} className="relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-primary">search</span>
          </div>
          <input 
            className="w-full pl-16 pr-16 py-6 bg-white border-none rounded-xl text-xl font-headline font-semibold text-on-surface focus:ring-2 focus:ring-primary/20 shadow-sm transition-all duration-300 outline-none" 
            placeholder="Search for skills, tutors, or topics..." 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <div className="absolute inset-y-0 right-6 flex items-center cursor-pointer" onClick={() => setQuery('')}>
              <span className="material-symbols-outlined text-secondary hover:text-red-500 transition-colors">close</span>
            </div>
          )}
        </form>
        <div className="mt-4 flex items-center space-x-2">
          <span className="font-label text-xs uppercase tracking-widest text-secondary/70">
            {loading ? 'Searching...' : `Showing ${results.length} results for`}
          </span>
          {!loading && <span className="font-headline font-bold text-primary">'{initialQuery || 'All Gigs'}'</span>}
        </div>
      </section>

      {/* Filter & Sort Toolbar (Simplified for now) */}
      <section className="max-w-5xl mb-10 flex flex-col md:flex-row items-center justify-between bg-white p-4 rounded-xl border border-neutral-100 shadow-sm gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center space-x-2 px-5 py-2 rounded-full border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-all bg-white">
            <span>Subject: All</span>
            <span className="material-symbols-outlined text-xs">expand_more</span>
          </button>
          <button className="flex items-center space-x-2 px-5 py-2 rounded-full border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-all bg-white">
            <span>Price: Any</span>
            <span className="material-symbols-outlined text-xs">expand_more</span>
          </button>
        </div>
        <div className="flex items-center space-x-2 pr-4">
          <span className="text-xs text-secondary font-medium uppercase tracking-tighter">Sort by:</span>
          <button className="flex items-center space-x-1 text-sm font-bold text-neutral-900 group">
            <span>Relevance</span>
            <span className="material-symbols-outlined text-primary group-hover:translate-y-0.5 transition-transform">expand_more</span>
          </button>
        </div>
      </section>

      {/* Search Results Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">sync</span>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 text-red-700 rounded-xl border border-red-100">{error}</div>
      ) : results.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-2xl border border-dashed border-neutral-200">
          <span className="material-symbols-outlined text-6xl text-neutral-200 mb-4 block">search_off</span>
          <h3 className="text-xl font-bold text-neutral-900 font-headline">No results found</h3>
          <p className="text-neutral-500 mt-2 font-body text-lg">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl">
          {results.map((gig) => (
            <div key={gig.id} className="group bg-white rounded-xl p-6 transition-all duration-300 hover:shadow-xl relative border border-neutral-100 flex flex-col cursor-pointer">
              <div className="absolute top-4 right-4 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {gig.subject}
              </div>
              <h3 className="mt-8 text-xl font-bold leading-tight text-neutral-900 group-hover:text-primary transition-colors font-headline min-h-[3rem]">
                {gig.title}
              </h3>
              <div className="mt-6 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-100">
                  <img alt={gig.tutor_name} className="w-full h-full object-cover" src={gig.tutor_avatar || 'https://via.placeholder.com/40'} />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">{gig.tutor_name}</p>
                  <div className="flex items-center space-x-1">
                    <span className="material-symbols-outlined text-xs text-orange-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-xs font-medium text-secondary">{gig.tutor_rating}</span>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-neutral-50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-secondary uppercase font-bold tracking-widest font-headline">Price / session</span>
                  <span className="text-2xl font-headline font-extrabold text-primary">₹{parseInt(gig.price_per_session)}</span>
                </div>
                <Link href={`/book-session?id=${gig.id}`} className="px-5 py-2.5 rounded-lg border-2 border-primary text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all active:scale-95">
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer / Load More */}
      {!loading && results.length > 0 && (
        <div className="mt-16 py-12 border-t border-neutral-100 max-w-5xl text-center">
          <p className="text-neutral-500 font-body">End of results</p>
        </div>
      )}
    </main>
  );
}

export default function SearchResultPage() {
  return (
    <div className="bg-surface min-h-screen text-on-surface font-body">
      <TopNavBar />
      <div className="flex pt-16">
        <Sidebar />
        <Suspense fallback={<div className="flex-1 lg:ml-64 p-20 text-center"><span className="animate-spin material-symbols-outlined">sync</span></div>}>
          <SearchContent />
        </Suspense>
      </div>
    </div>
  );
}
