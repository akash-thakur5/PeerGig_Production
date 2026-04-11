import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function ProposeSwapPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen font-body selection:bg-primary-container selection:text-on-primary-container">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 h-16 w-full shadow-sm shadow-slate-200/50">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-slate-900 font-headline">PeerGig</Link>
        </div>
        <div className="hidden md:flex items-center gap-8 font-headline tracking-tight">
          <Link className="text-slate-500 hover:text-slate-900 transition-colors" href="/dashboard">Dashboard</Link>
          <Link className="text-slate-500 hover:text-slate-900 transition-colors" href="/tutor">Tutors</Link>
          <Link className="text-orange-600 font-semibold border-b-2 border-orange-600" href="/skillswap">Skillswap</Link>
          <Link className="text-slate-500 hover:text-slate-900 transition-colors" href="/connect">Peer Connect</Link>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors active:scale-95 duration-200">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors active:scale-95 duration-200">
            <span className="material-symbols-outlined">chat</span>
          </button>
          <img 
            alt="User profile" 
            className="w-8 h-8 rounded-full bg-slate-200 object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1qYlUx62lOqvVD6JX5fcSya0xHQicabRAZgYHcUdAqcFs8tD0qWxxLUXkduj-jp6GCgrq8LCLpNn7g1bSft-ornDaKjpX73S9AfAdK57j4RHez4ceNMFYIjIypWav5xaLfqQpZ4awwwZ6Jpw1YC_sE7j3geKyDvbW1vN9-Gmz8hKxgDAxZaYzjKNRhNhU2hyks3sGT98G9TDBiJ6EEfpViMClmII3C9jjAAoJ95F-5tMGbsEuCTWbrgft2XaKdkJgiKZ-8GNTAw" 
          />
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row min-h-screen pt-16">
        {/* SideNavBar (Desktop Only) */}
        <Sidebar />

        {/* Main Content Canvas */}
        <main className="flex-grow pt-8 pb-12 px-6 lg:ml-64 max-w-7xl mx-auto">
          {/* Back Link Header */}
          <header className="mb-8 font-body">
            <Link className="group flex items-center gap-2 text-secondary font-medium text-sm hover:text-primary transition-colors" href="/skillswap">
              <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
              &lt; Back to Skillswap Dashboard
            </Link>
          </header>

          <div className="flex flex-col lg:flex-row gap-12 font-body">
            {/* Left Column: Swap Details (70%) */}
            <section className="lg:w-[70%]">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight mb-10 text-on-surface font-headline">
                Swap: Python Data Analysis for <span className="text-orange-600">Figma UI/UX</span>
              </h1>
              
              {/* Offer Section */}
              <div className="bg-surface-container-low p-8 rounded-2xl mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-orange-600">
                    <span className="material-symbols-outlined text-3xl">school</span>
                  </div>
                  <div>
                    <span className="text-[0.6875rem] font-bold tracking-widest text-orange-600 uppercase mb-1 block">The Expertise</span>
                    <h2 className="text-xl font-bold mb-3 font-headline text-on-surface">They can teach: Python Data Analysis | Proficiency: Expert</h2>
                    <p className="text-secondary leading-relaxed max-w-2xl">
                      I can guide you through Pandas, NumPy, and data cleaning workflows. Whether you're struggling with messy CSVs or want to build automated visualization pipelines in Matplotlib, I'll show you the industry-standard "Pythonic" way to handle big data.
                    </p>
                  </div>
                </div>
              </div>

              {/* Visual Separator */}
              <div className="flex justify-center my-6">
                <div className="bg-surface-container-high w-12 h-12 rounded-full flex items-center justify-center text-primary-container">
                  <span className="material-symbols-outlined text-2xl font-bold">arrow_downward</span>
                </div>
              </div>

              {/* Request Section */}
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/20 mb-10">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-surface-container-low rounded-xl text-primary">
                    <span className="material-symbols-outlined text-3xl">book_5</span>
                  </div>
                  <div>
                    <span className="text-[0.6875rem] font-bold tracking-widest text-primary uppercase mb-1 block">The Learning Goal</span>
                    <h2 className="text-xl font-bold mb-3 font-headline text-on-surface">They want to learn: UI/UX Design in Figma | Current Level: Complete Beginner</h2>
                    <p className="text-secondary leading-relaxed max-w-2xl">
                      I need someone to teach me auto-layout, component libraries, and basic prototyping. I'm building a personal portfolio site and want it to look professional rather than "developer-made."
                    </p>
                  </div>
                </div>
              </div>

              {/* Commitment Info */}
              <div className="flex items-center gap-3 p-4 bg-surface-container-low/50 rounded-xl mb-12 border-l-4 border-orange-600">
                <span className="material-symbols-outlined text-orange-600">schedule</span>
                <span className="font-medium text-on-surface">Expected Commitment: <span className="font-bold text-orange-600">1 hour per week</span></span>
              </div>

              {/* CTA */}
              <button className="group flex items-center gap-3 px-10 py-5 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-lg hover:-translate-y-1 transition-all active:scale-95 duration-200 font-headline">
                <span className="material-symbols-outlined">chat_bubble</span>
                <span className="text-lg">Propose Swap</span>
                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
              </button>
            </section>

            {/* Right Column: Profile & Info (30%) */}
            <aside className="lg:w-[30%]">
              <div className="sticky top-24">
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/20">
                  {/* Profile Header */}
                  <div className="flex flex-col items-center text-center mb-8">
                    <div className="relative mb-4">
                      <img 
                        alt="Sarah Jenkins" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-surface-container-low shadow-sm" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaJU9I9yONKMZamKq3Jw77eh2SQk6SZ2mCsnRDNkowaKw6oYuI9lBTa-Xnj-rHguqbEEu4ucnxSTCKnCT-LRbH-vxskKqVrObcbfrt-TJGovChfJ78et_yvucA1rtI0rMZqkPEYnWWqKuOuQcUbsjO_XJeOznhZrqi6QwQpZ5o1slgC_jNJQPs-gnc-wIAd_Y-mcUGqczvN0x92i-55-RbwXZCjJqezDTeT5lKCRzlhtNPyuLUXzXk-z11ji5aX7YWYIXZVrU2zGY" 
                      />
                      <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-4 border-white"></div>
                    </div>
                    <h3 className="text-2xl font-bold mb-1 font-headline text-on-surface">Sarah Jenkins</h3>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-low rounded-full">
                      <span className="material-symbols-outlined text-orange-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                      <span className="text-xs font-bold text-on-surface-variant font-body">Swap Rating: 4.9 ★ (12 Swaps)</span>
                    </div>
                  </div>

                  {/* Credentials */}
                  <div className="space-y-4 mb-8 font-body">
                    <div className="flex items-center gap-3 text-secondary text-sm">
                      <span className="material-symbols-outlined text-primary">school</span>
                      <span>M.Sc. Data Science</span>
                    </div>
                    <div className="flex items-center gap-3 text-secondary text-sm">
                      <span className="material-symbols-outlined text-primary">account_balance</span>
                      <span>Tech University</span>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="border-t border-surface-container-high pt-6 font-body">
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-3 text-on-surface font-headline">About Sarah</h4>
                    <p className="text-sm text-secondary leading-relaxed">
                      Lead analyst with 5 years of experience in data visualization. Passionate about cross-disciplinary learning and looking to refine my design eye.
                    </p>
                  </div>
                </div>

                {/* Trust Badge */}
                <div className="mt-6 p-4 bg-orange-50 rounded-xl flex items-center gap-3 font-body">
                  <span className="material-symbols-outlined text-orange-600">verified_user</span>
                  <span className="text-xs font-semibold text-orange-800">PeerGig Identity Verified</span>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>

      {/* Mobile Navigation (hidden on LG+) */}
      <nav className="lg:hidden fixed bottom-0 w-full bg-white border-t border-slate-100 flex justify-around items-center h-16 px-4 z-50">
        <Link className="flex flex-col items-center gap-1 text-slate-400" href="/dashboard">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-medium font-body">Home</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 text-orange-600" href="/skillswap">
          <span className="material-symbols-outlined">sync_alt</span>
          <span className="text-[10px] font-medium font-body">Skillswap</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 text-slate-400" href="/chats">
          <span className="material-symbols-outlined">chat</span>
          <span className="text-[10px] font-medium font-body">Chats</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 text-slate-400" href="/profile">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-medium font-body">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
