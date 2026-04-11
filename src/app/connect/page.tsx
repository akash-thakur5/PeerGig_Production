"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import TopNavBar from "@/components/TopNavBar";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Peer {
  peer_id: number;
  peer_name: string;
  peer_avatar: string;
  last_message: string;
  last_message_time: string;
  is_read: boolean;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface CurrentUser {
  id: number;
  name: string;
  avatarUrl: string;
}

// ─── Static feed posts ───────────────────────────────────────────────────────
const FEED_POSTS = [
  {
    id: 1,
    author: "Arjun Mehta",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLGFj3bFY26EelUWXNFUFVCj3rV7dseE-nG46kvlzbh0hQj_MW-kBUrlBRipo_WQqH3i0wRVg-RecKEHz9ouDcKYuKopt8ZkftCW5lVfNhAMXKIuCuhRoZu4JdGzO-Mq4B6euGNwZgz2CNIoQqqn9oA0X9ATu9bA2tQX5Wj3naOSGNn4vmvxmfHUdsjzktlcXAVi6evVjg7tKA7wofXxOBeoGUI1aJicEu-zuBeozCH2TopgagBaVU0MmtNDTghpU6c976tYBrkJ0",
    role: "Senior",
    timeAgo: "2h ago",
    title: "My 2024 Roadmap for Full-Stack Mastery",
    body: "If you're looking to level up this year, focus on deep-diving into Next.js App Router and understanding distributed systems. Don't just build apps, build scalable architecture. Here's my personal checklist for senior-level proficiency...",
    upvotes: 1243,
    comments: 42,
  },
  {
    id: 2,
    author: "Priya Sharma",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAkDgGbD1vPmNA7mjkFoI1W1VDDj5Fa2UKVUSuybzRbkisulSDYHvdyyQwZlIi5kU2atWO_jfcxAp5M2A4jl7GTzcFdIM1eNIxvAGs44GSNwsEkBKX6sl6rMVEuiuMZeOukVOHhYtrGPHI8Jvuypz8B6bMbzZSE7qaDSEcilbd6syMS8ZiDOg-rjes_oEHEGYKEf_cePi2pRt1_es20UPgxk47clUv2nZy6Rj0NgxYlQWPHFKp0SZJVqkpn47zWfd400ka8wYhyAyI",
    role: "Learner",
    timeAgo: "5h ago",
    title: "How teaching Electrostatics made me understand it 10x better",
    body: "I was struggling with Class 12 Physics myself. After posting a gig to teach it on PeerGig, I had to break down every concept from scratch. That exercise alone gave me more clarity than 3 months of self-study. Highly recommend everyone try teaching what you're learning.",
    upvotes: 856,
    comments: 18,
  },
  {
    id: 3,
    author: "Arjun Mehta",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLGFj3bFY26EelUWXNFUFVCj3rV7dseE-nG46kvlzbh0hQj_MW-kBUrlBRipo_WQqH3i0wRVg-RecKEHz9ouDcKYuKopt8ZkftCW5lVfNhAMXKIuCuhRoZu4JdGzO-Mq4B6euGNwZgz2CNIoQqqn9oA0X9ATu9bA2tQX5Wj3naOSGNn4vmvxmfHUdsjzktlcXAVi6evVjg7tKA7wofXxOBeoGUI1aJicEu-zuBeozCH2TopgagBaVU0MmtNDTghpU6c976tYBrkJ0",
    role: "Senior",
    timeAgo: "1d ago",
    title: "DSA Tip: Stop memorizing, start pattern-matching",
    body: "After clearing 5 coding interviews this year, here's what I learned — there are only about 15 core patterns in DSA (sliding window, two-pointer, BFS/DFS, DP, etc.). Once you recognise the pattern, the solution becomes obvious. I'll share my pattern sheet in the comments.",
    upvotes: 2104,
    comments: 93,
  },
];

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PeerConnectPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [activePeer, setActivePeer] = useState<Peer | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [view, setView] = useState<"feed" | "chat">("feed");
  const [postText, setPostText] = useState("");
  const [votes, setVotes] = useState<Record<number, number>>(() =>
    Object.fromEntries(FEED_POSTS.map((p) => [p.id, p.upvotes]))
  );
  const [voted, setVoted] = useState<Record<number, "up" | "down" | null>>({});
  const [posts, setPosts] = useState(FEED_POSTS);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // ── Load current user ──
  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setCurrentUser({ id: d.user.id, name: d.user.name, avatarUrl: d.user.avatar_url });
      })
      .catch(() => {});
  }, []);

  // ── Load conversations list ──
  const loadPeers = () => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((d) => { if (d.conversations) setPeers(d.conversations); })
      .catch(() => {});
  };

  useEffect(() => { loadPeers(); }, []);

  // ── Load + poll messages for active peer ──
  const loadMessages = (peerId: number) => {
    fetch(`/api/messages/${peerId}`)
      .then((r) => r.json())
      .then((d) => { if (d.messages) setMessages(d.messages); })
      .catch(() => {});
  };

  useEffect(() => {
    if (!activePeer) return;
    loadMessages(activePeer.peer_id);
    pollRef.current = setInterval(() => loadMessages(activePeer.peer_id), 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activePeer]);

  // ── Scroll to bottom on new messages ──
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ──
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !activePeer || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiver_id: activePeer.peer_id, content: newMsg.trim() }),
      });
      if (res.ok) {
        setNewMsg("");
        loadMessages(activePeer.peer_id);
        loadPeers();
      }
    } finally {
      setSending(false);
    }
  };

  // ── Open chat with a peer ──
  const openChat = (peer: Peer) => {
    setActivePeer(peer);
    setMessages([]);
    setView("chat");
  };

  // ── Vote ──
  const handleVote = (postId: number, dir: "up" | "down") => {
    const prev = voted[postId];
    setVoted((v) => ({ ...v, [postId]: prev === dir ? null : dir }));
    setVotes((v) => ({
      ...v,
      [postId]:
        prev === dir
          ? v[postId] + (dir === "up" ? -1 : 1)
          : v[postId] + (dir === "up" ? (prev === "down" ? 2 : 1) : prev === "up" ? -2 : -1),
    }));
  };

  // ── Post ──
  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !currentUser) return;
    const newPost = {
      id: Date.now(),
      author: currentUser.name,
      avatar: currentUser.avatarUrl,
      role: "Member",
      timeAgo: "Just now",
      title: postText.trim().slice(0, 80),
      body: postText.trim(),
      upvotes: 0,
      comments: 0,
    };
    setPosts((prev) => [newPost, ...prev]);
    setVotes((v) => ({ ...v, [newPost.id]: 0 }));
    setPostText("");
  };

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary/20 min-h-screen">
      <TopNavBar />

      <div className="flex pt-16 h-screen overflow-hidden">
        <Sidebar />

        {/* ── Main 3-pane layout ── */}
        <main className="flex-1 flex overflow-hidden lg:ml-64">

          {/* ── LEFT PANE: Direct Messages ── */}
          <section className="hidden lg:flex w-72 shrink-0 flex-col bg-stone-50 border-r border-stone-200/60">
            <div className="p-5 border-b border-stone-200/60">
              <h2 className="font-headline text-base font-bold text-on-surface tracking-tight">Peer Messages</h2>
              <p className="text-xs text-secondary mt-0.5">{peers.length} conversation{peers.length !== 1 && "s"}</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {peers.length === 0 ? (
                <div className="p-6 text-center text-secondary">
                  <span className="material-symbols-outlined text-3xl block mb-2 text-stone-300">chat_bubble</span>
                  <p className="text-xs">No messages yet.<br />Start a chat below!</p>
                </div>
              ) : (
                <div className="py-2">
                  {peers.map((peer) => (
                    <button
                      key={peer.peer_id}
                      onClick={() => openChat(peer)}
                      className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-all hover:bg-white border-l-4 ${
                        activePeer?.peer_id === peer.peer_id
                          ? "border-primary bg-white shadow-sm"
                          : "border-transparent"
                      }`}
                    >
                      <div className="relative shrink-0">
                        {peer.peer_avatar ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden relative ring-2 ring-white">
                            <Image fill className="object-cover" src={peer.peer_avatar} alt={peer.peer_name} sizes="40px" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                            {peer.peer_name.charAt(0)}
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-stone-50 rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-sm text-stone-900 font-headline truncate">{peer.peer_name}</span>
                          <span className="text-[10px] text-stone-400 shrink-0 ml-1">{timeAgo(peer.last_message_time)}</span>
                        </div>
                        <p className={`text-xs truncate mt-0.5 ${!peer.is_read ? "font-bold text-stone-700" : "text-stone-400"}`}>
                          {peer.last_message}
                        </p>
                      </div>
                      {!peer.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Find peers prompt */}
            <div className="p-4 border-t border-stone-200/60">
              <p className="text-xs text-secondary text-center mb-2">Message a peer from their profile</p>
              <Link href="/search" className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary/5 border border-primary/20 text-primary rounded-xl text-xs font-bold font-headline hover:bg-primary/10 transition-colors">
                <span className="material-symbols-outlined text-sm">person_search</span>
                Find Peers
              </Link>
            </div>
          </section>

          {/* ── CENTER PANE: Feed or Chat ── */}
          <section className="flex-1 flex flex-col bg-white overflow-hidden min-w-0">

            {/* Toggle tabs */}
            <div className="border-b border-stone-200/60 px-6 py-3 flex items-center justify-between shrink-0">
              <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
                <button
                  onClick={() => setView("feed")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold font-headline uppercase tracking-wider transition-all ${
                    view === "feed" ? "bg-white text-primary shadow-sm" : "text-secondary hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm align-middle mr-1">feed</span>
                  Community Feed
                </button>
                <button
                  onClick={() => { setView("chat"); }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold font-headline uppercase tracking-wider transition-all ${
                    view === "chat" ? "bg-white text-primary shadow-sm" : "text-secondary hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm align-middle mr-1">chat</span>
                  Messages
                  {peers.some((p) => !p.is_read) && (
                    <span className="ml-1.5 w-2 h-2 rounded-full bg-primary inline-block" />
                  )}
                </button>
              </div>
              {view === "chat" && activePeer && (
                <div className="flex items-center gap-2 text-sm font-bold text-on-surface font-headline">
                  <span className="material-symbols-outlined text-primary text-base">chat</span>
                  {activePeer.peer_name}
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Online</span>
                </div>
              )}
            </div>

            {/* ── FEED VIEW ── */}
            {view === "feed" && (
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto py-6 px-6 space-y-6">
                  {/* Compose post */}
                  <form onSubmit={handlePost} className="bg-stone-50 rounded-2xl border border-stone-200/60 p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                        {currentUser?.name.charAt(0) ?? "U"}
                      </div>
                      <textarea
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                        placeholder="Share something with your peers — a tip, resource, or question..."
                        rows={2}
                        className="flex-1 bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-secondary/60 resize-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!postText.trim()}
                        className="flex items-center gap-2 px-5 py-2 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl text-xs font-bold font-headline uppercase tracking-wider hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:translate-y-0"
                      >
                        <span className="material-symbols-outlined text-sm">send</span>
                        Post
                      </button>
                    </div>
                  </form>

                  {/* Feed posts */}
                  {posts.map((post) => (
                    <article key={post.id} className="bg-surface-container-lowest rounded-2xl p-6 border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="relative w-10 h-10 shrink-0">
                          <Image
                            className="rounded-full object-cover ring-2 ring-white"
                            fill
                            src={post.avatar}
                            alt={post.author}
                            sizes="40px"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-stone-900 font-headline">{post.author}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-orange-50 px-2 py-0.5 rounded">{post.role}</span>
                            <span className="text-[10px] text-stone-400">• {post.timeAgo}</span>
                          </div>
                        </div>
                      </div>
                      <h3 className="font-headline text-base font-bold mb-2 text-on-surface">{post.title}</h3>
                      <p className="text-stone-600 leading-relaxed text-sm">{post.body}</p>
                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-stone-100">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-stone-100 rounded-full overflow-hidden">
                            <button
                              onClick={() => handleVote(post.id, "up")}
                              className={`p-2 transition-colors active:scale-90 ${voted[post.id] === "up" ? "text-primary" : "hover:text-primary"}`}
                            >
                              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: voted[post.id] === "up" ? "'FILL' 1" : "'FILL' 0" }}>arrow_upward</span>
                            </button>
                            <span className="text-xs font-bold text-stone-700 px-1">{(votes[post.id] ?? post.upvotes).toLocaleString("en-IN")}</span>
                            <button
                              onClick={() => handleVote(post.id, "down")}
                              className={`p-2 transition-colors active:scale-90 ${voted[post.id] === "down" ? "text-red-500" : "hover:text-red-500"}`}
                            >
                              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: voted[post.id] === "down" ? "'FILL' 1" : "'FILL' 0" }}>arrow_downward</span>
                            </button>
                          </div>
                          <button className="flex items-center gap-1.5 text-stone-400 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-lg">chat_bubble</span>
                            <span className="text-xs font-bold">{post.comments}</span>
                          </button>
                        </div>
                        <button className="text-stone-400 hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-lg">share</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* ── CHAT VIEW ── */}
            {view === "chat" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {!activePeer ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-secondary">
                    <span className="material-symbols-outlined text-6xl text-stone-200 mb-4">chat_bubble</span>
                    <p className="font-headline font-bold text-on-surface text-lg mb-1">Select a conversation</p>
                    <p className="text-sm text-secondary">Pick a peer from the left panel to start chatting</p>
                    {peers.length === 0 && (
                      <Link href="/search" className="mt-6 flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm font-headline hover:-translate-y-0.5 transition-all">
                        <span className="material-symbols-outlined">person_search</span>
                        Find Peers to Message
                      </Link>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Messages thread */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-3">
                      {messages.length === 0 && (
                        <div className="text-center text-secondary py-10">
                          <span className="material-symbols-outlined text-4xl text-stone-200 block mb-2">waving_hand</span>
                          <p className="text-sm">Say hi to {activePeer.peer_name}!</p>
                        </div>
                      )}
                      {messages.map((msg) => {
                        const isMine = currentUser && msg.sender_id === currentUser.id;
                        return (
                          <div key={msg.id} className={`flex gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                            {!isMine && (
                              <div className="w-8 h-8 rounded-full overflow-hidden relative shrink-0 mt-1">
                                {activePeer.peer_avatar ? (
                                  <Image fill className="object-cover" src={activePeer.peer_avatar} alt={activePeer.peer_name} sizes="32px" />
                                ) : (
                                  <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                    {activePeer.peer_name.charAt(0)}
                                  </div>
                                )}
                              </div>
                            )}
                            <div className={`max-w-[70%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-1`}>
                              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                isMine
                                  ? "bg-gradient-to-br from-primary to-primary-container text-white rounded-tr-sm"
                                  : "bg-stone-100 text-stone-800 rounded-tl-sm"
                              }`}>
                                {msg.content}
                              </div>
                              <span className="text-[10px] text-stone-400 px-1">{timeAgo(msg.created_at)}</span>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatBottomRef} />
                    </div>

                    {/* Message input */}
                    <form onSubmit={sendMessage} className="border-t border-stone-200/60 p-4 flex gap-3 items-end bg-white shrink-0">
                      <textarea
                        value={newMsg}
                        onChange={(e) => setNewMsg(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(e as any); } }}
                        placeholder={`Message ${activePeer.peer_name}...`}
                        rows={1}
                        className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-secondary/60 resize-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                      <button
                        type="submit"
                        disabled={!newMsg.trim() || sending}
                        className="w-11 h-11 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl flex items-center justify-center hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:translate-y-0 shrink-0"
                      >
                        <span className="material-symbols-outlined text-xl">{sending ? "sync" : "send"}</span>
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}
          </section>

          {/* ── RIGHT PANE: Online Peers ── */}
          <section className="hidden xl:flex w-64 shrink-0 flex-col bg-stone-50 border-l border-stone-200/60">
            <div className="p-5 border-b border-stone-200/60">
              <h2 className="font-headline text-base font-bold text-on-surface tracking-tight">Online Peers</h2>
            </div>
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {/* Real users from conversations */}
              {peers.map((peer) => (
                <div key={peer.peer_id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-9 h-9 shrink-0">
                      {peer.peer_avatar ? (
                        <div className="w-9 h-9 rounded-full overflow-hidden relative ring-2 ring-white">
                          <Image fill className="object-cover" src={peer.peer_avatar} alt={peer.peer_name} sizes="36px" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {peer.peer_name.charAt(0)}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-stone-50 rounded-full" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900 group-hover:text-primary transition-colors font-headline leading-none">{peer.peer_name}</p>
                      <p className="text-[10px] text-stone-400 uppercase tracking-wider mt-0.5">Active</p>
                    </div>
                  </div>
                  <button onClick={() => openChat(peer)} className="p-1.5 text-primary hover:bg-orange-50 rounded-full transition-all opacity-0 group-hover:opacity-100 active:scale-90">
                    <span className="material-symbols-outlined text-base">chat_bubble</span>
                  </button>
                </div>
              ))}

              {/* Divider & communities */}
              <div className="pt-4 mt-4 border-t border-stone-200/60">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 font-headline">Communities</p>
                {["Web Dev Seniors", "Advanced Calculus", "UI/UX Enthusiasts"].map((name) => (
                  <button key={name} className="w-full text-left flex items-center gap-2 py-2.5 px-2 rounded-xl hover:bg-white transition-colors group">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold text-xs">#</span>
                    </div>
                    <span className="font-semibold text-xs text-stone-600 group-hover:text-stone-900 font-headline">{name}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

        </main>
      </div>

      {/* FAB */}
      <button
        onClick={() => { setView("feed"); setPostText(""); }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[60]"
      >
        <span className="material-symbols-outlined text-2xl">create</span>
      </button>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-outline-variant/10 flex justify-around p-3 z-40">
        <Link className="flex flex-col items-center gap-1 text-secondary hover:text-primary transition-colors" href="/dashboard">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-bold">Dash</span>
        </Link>
        <button onClick={() => setView("feed")} className={`flex flex-col items-center gap-1 transition-colors ${view === "feed" ? "text-primary" : "text-secondary"}`}>
          <span className="material-symbols-outlined">feed</span>
          <span className="text-[10px] font-bold">Feed</span>
        </button>
        <button onClick={() => setView("chat")} className={`flex flex-col items-center gap-1 transition-colors relative ${view === "chat" ? "text-primary" : "text-secondary"}`}>
          <span className="material-symbols-outlined">chat</span>
          {peers.some((p) => !p.is_read) && <span className="absolute top-0 right-2 w-2 h-2 bg-primary rounded-full" />}
          <span className="text-[10px] font-bold">Chat</span>
        </button>
        <Link className="flex flex-col items-center gap-1 text-secondary hover:text-primary transition-colors" href="/wallet">
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span className="text-[10px] font-bold">Wallet</span>
        </Link>
      </nav>
    </div>
  );
}
