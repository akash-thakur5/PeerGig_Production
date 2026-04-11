"use client";

import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import TopNavBar from '@/components/TopNavBar';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activePeer, setActivePeer] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load: Fetch Conversations & Current User
  useEffect(() => {
    const init = async () => {
      try {
        const [meRes, convRes] = await Promise.all([
          fetch('/api/users/me'),
          fetch('/api/messages')
        ]);
        const meData = await meRes.json();
        const convData = await convRes.json();

        if (meData.user) setCurrentUserId(meData.user.id);
        if (convData.conversations) {
          setConversations(convData.conversations);
          // Auto-select first conversation if exists
          if (convData.conversations.length > 0) {
            setActivePeer(convData.conversations[0]);
          }
        }
      } catch (err) {
        console.error('Failed to init messages:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // 2. Load Thread: Fetch messages when activePeer changes
  useEffect(() => {
    if (!activePeer) return;

    const fetchThread = async () => {
      setThreadLoading(true);
      try {
        const res = await fetch(`/api/messages/${activePeer.peer_id}`);
        const data = await res.json();
        if (data.messages) setMessages(data.messages);
      } catch (err) {
        console.error('Failed to fetch thread:', err);
      } finally {
        setThreadLoading(false);
      }
    };

    fetchThread();

    // Set up polling for new messages (every 5 seconds)
    const interval = setInterval(fetchThread, 5000);
    return () => clearInterval(interval);
  }, [activePeer]);

  // 3. Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, threadLoading]);

  // 4. Send Message
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !activePeer) return;

    const content = newMessage;
    setNewMessage('');

    // Optimistic Update
    const tempMsg = {
      id: Date.now(),
      sender_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiver_id: activePeer.peer_id, content })
      });
      if (!res.ok) throw new Error('Failed to send');
      
      // Update conversations list with last message
      const updatedConv = conversations.map(c => 
        c.peer_id === activePeer.peer_id 
          ? { ...c, last_message: content, last_message_time: new Date().toISOString() }
          : c
      );
      setConversations(updatedConv);
    } catch (err) {
      console.error('Send failed:', err);
      // Remove optimistic message if failed? Or show error.
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
    <div className="bg-surface font-body text-on-surface selection:bg-primary/20 min-h-screen">
      {/* TopNavBar */}
      <header className="bg-white/80 backdrop-blur-md w-full sticky top-0 z-50 border-b border-[#f6f2f7] shadow-sm font-headline tracking-tight h-16 flex justify-between items-center px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black text-[#1b1b1e] tracking-tighter">PeerGig</Link>
          <div className="hidden md:flex gap-6 items-center">
            <Link className="text-primary font-bold border-b-2 border-primary pb-1 text-sm" href="/messages">Messages</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-secondary hover:text-primary transition-colors">notifications</button>
          <Link href="/profile" className="flex items-center">
            <span className="material-symbols-outlined text-secondary hover:text-primary transition-colors">account_circle</span>
          </Link>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* SideNavBar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="lg:ml-64 flex-1 flex overflow-hidden bg-white">
          
          {/* Left Pane: Conversations List */}
          <section className="w-full md:w-[320px] lg:w-[380px] bg-white border-r border-surface-container-high flex flex-col shrink-0">
            <div className="p-6 pb-4">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-bold text-on-surface">Inbox</h1>
                <button className="p-2 text-secondary hover:bg-surface-container-low rounded-lg transition-colors">
                  <span className="material-symbols-outlined">edit_square</span>
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg">search</span>
                <input 
                  className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-sm outline-none font-body" 
                  placeholder="Search conversations..." 
                  type="text" 
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              {conversations.length === 0 ? (
                <div className="text-center py-10 px-6">
                  <p className="text-secondary text-sm">No conversations yet. Book a session to start chatting!</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div 
                    key={conv.peer_id}
                    onClick={() => setActivePeer(conv)}
                    className={`px-4 mb-1 cursor-pointer group`}
                  >
                    <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                      activePeer?.peer_id === conv.peer_id 
                        ? 'bg-primary/5 border-l-4 border-primary' 
                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                    }`}>
                      <div className="relative shrink-0 w-12 h-12">
                        <Image 
                          alt={conv.peer_name} 
                          fill
                          className="rounded-full object-cover" 
                          src={conv.peer_avatar || 'https://lh3.googleusercontent.com/a/default-user'} 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <h3 className="font-bold text-on-surface truncate font-headline text-sm">{conv.peer_name}</h3>
                          <span className="text-[10px] text-secondary">
                            {conv.last_message_time ? new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p className={`text-xs truncate font-body ${conv.is_read ? 'text-secondary' : 'font-bold text-primary'}`}>
                          {conv.last_message || 'Start a conversation...'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Right Pane: Active Chat Window */}
          <section className="hidden md:flex flex-1 flex-col bg-slate-50/30 overflow-hidden">
            {activePeer ? (
              <>
                {/* Chat Header */}
                <header className="h-20 bg-white px-8 flex justify-between items-center border-b border-[#f6f2f7] shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="relative w-10 h-10">
                      <Image 
                        alt={activePeer.peer_name} 
                        fill
                        className="rounded-full object-cover" 
                        src={activePeer.peer_avatar || 'https://lh3.googleusercontent.com/a/default-user'} 
                      />
                    </div>
                    <div>
                      <h2 className="font-bold text-on-surface leading-none font-headline text-base">{activePeer.peer_name}</h2>
                      <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider font-body">Active Now</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="material-symbols-outlined text-secondary hover:text-primary transition-colors">videocam</button>
                    <button className="material-symbols-outlined text-secondary hover:text-primary transition-colors">info</button>
                  </div>
                </header>

                {/* Message Thread */}
                <div 
                  ref={scrollRef}
                  className="flex-1 p-8 overflow-y-auto flex flex-col gap-6 scrollbar-hide"
                >
                  {threadLoading && messages.length === 0 ? (
                    <div className="flex-1 flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`flex flex-col ${msg.sender_id === currentUserId ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          msg.sender_id === currentUserId 
                            ? 'bg-gradient-to-br from-primary to-primary-container text-white rounded-br-none' 
                            : 'bg-white text-on-surface rounded-bl-none border border-[#f0f0f0]'
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-[9px] text-secondary mt-1 px-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-[#f6f2f7] shrink-0">
                  <form 
                    onSubmit={handleSend}
                    className="max-w-4xl mx-auto flex items-center gap-4 bg-gray-50 p-2 pr-2 rounded-full border border-gray-200 focus-within:border-primary transition-all"
                  >
                    <button type="button" className="p-2 text-secondary hover:text-primary">
                      <span className="material-symbols-outlined">attach_file</span>
                    </button>
                    <input 
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-on-surface font-body outline-none px-2" 
                      placeholder="Type a message..." 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:translate-y-[-2px] active:scale-90 transition-all disabled:opacity-50 disabled:translate-y-0"
                    >
                      <span className="material-symbols-outlined">send</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
                <span className="material-symbols-outlined text-6xl">chat_bubble_outline</span>
                <p className="font-headline font-bold">Select a conversation to start chatting</p>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Mobile Bottom NavBar Placeholder */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around z-50">
        <Link className="flex flex-col items-center gap-1 text-secondary" href="/dashboard">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 text-primary" href="/messages">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
          <span className="text-[10px] font-bold">Chat</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 text-secondary" href="/profile">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-bold">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
