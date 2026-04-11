"use client";

import { useState, useEffect } from 'react';

export default function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const target = new Date(targetDate).getTime();
    
    const update = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((target - now) / 1000));
      setTimeLeft(diff);
    };
    
    update();
    const intervalId = setInterval(update, 1000);
    return () => clearInterval(intervalId);
  }, [targetDate]);

  if (!mounted) {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="text-[10px] text-secondary font-bold uppercase tracking-widest animate-pulse">Loading timing...</span>
        <div className="h-6 w-24 bg-green-100/50 dark:bg-green-900/50 animate-pulse rounded-md"></div>
      </div>
    );
  }

  if (timeLeft <= 0) {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest animate-pulse">Status</span>
        <span className="text-xs font-bold text-green-600 flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-md border border-green-200">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> 
          Live Now
        </span>
      </div>
    );
  }

  const h = Math.floor(timeLeft / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;

  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">Session live in</span>
      <div className="flex items-center gap-1 text-[12px] font-mono font-bold bg-white dark:bg-zinc-800 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-md border border-green-200 dark:border-green-800/50 shadow-sm">
        <span className="material-symbols-outlined text-[13px] text-green-500 animate-pulse">timer</span>
        {h > 0 ? `${h}h ` : ''}{m.toString().padStart(2, '0')}m {s.toString().padStart(2, '0')}s
      </div>
    </div>
  );
}
