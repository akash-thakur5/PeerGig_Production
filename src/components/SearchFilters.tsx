"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface SearchFiltersProps {
  q: string;
  subject: string;
  sort: string;
  language: string;
}

export default function SearchFilters({ q, subject, sort, language }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    router.push(`/student?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-outline-variant shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20">
        <span className="material-symbols-outlined text-sm text-secondary">sort</span>
        <select 
          name="sort" 
          defaultValue={sort} 
          onChange={(e) => handleFilterChange('sort', e.target.value)} 
          className="bg-transparent text-xs font-bold text-on-surface outline-none cursor-pointer"
        >
          <option value="newest">Newly Created</option>
          <option value="newly_joined">Newly Joined Teachers</option>
          <option value="price_low">Lowest Price First</option>
          <option value="rating_high">Highest Rated Teachers</option>
        </select>
      </div>

      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-outline-variant shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20">
        <span className="material-symbols-outlined text-sm text-secondary">language</span>
        <select 
          name="language" 
          defaultValue={language} 
          onChange={(e) => handleFilterChange('language', e.target.value)} 
          className="bg-transparent text-xs font-bold text-on-surface outline-none cursor-pointer"
        >
          <option value="">All Languages</option>
          <option value="English">English</option>
          <option value="Hindi">Hindi</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
        </select>
      </div>

      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-outline-variant shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20">
        <span className="material-symbols-outlined text-sm text-secondary">category</span>
        <select 
          name="subject" 
          defaultValue={subject} 
          onChange={(e) => handleFilterChange('subject', e.target.value)} 
          className="bg-transparent text-xs font-bold text-on-surface outline-none cursor-pointer tracking-tight"
        >
          <option value="">All Subjects</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Physics">Physics</option>
          <option value="Marketing">Marketing</option>
          <option value="Digital Arts">Digital Arts</option>
        </select>
      </div>

      { (q || subject || language || sort !== 'newest') && (
        <Link href="/student" className="text-xs font-bold text-primary hover:underline flex items-center gap-1 ml-2">
          <span className="material-symbols-outlined text-sm">close</span>
          Clear Filters
        </Link>
      )}
    </div>
  );
}
