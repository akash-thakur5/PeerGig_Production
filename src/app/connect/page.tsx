"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import TopNavBar from "@/components/TopNavBar";
import Link from "next/link";
import { getPusherClient } from "@/lib/pusher";

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

interface Community {
  id: number;
  name: string;
  description: string;
  member_count: number;
  is_member: boolean;
}

interface CommunityPost {
  id: number;
  author: string;
  avatar: string;
  role: string;
  title: string;
  content: string;
  upvotes: number;
  created_at: string;
}

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
  
  // Messaging state
  const [peers, setPeers] = useState<Peer[]>([]);
  const [activePeer, setActivePeer] = useState<Peer | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Community state
  const [communities, setCommunities] = useState<Community[]>([]);
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(null);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [postText, setPostText] = useState("");
  
  // Create Community Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState("");
  const [newCommunityDesc, setNewCommunityDesc] = useState("");
  
  // UI state
  const [view, setView] = useState<"feed" | "chat">("feed");
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [voted, setVoted] = useState<Record<number, "up" | "down" | null>>({});
  
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const activePeerRef = useRef<Peer | null>(null);

  // Keep ref in sync for Pusher callback
  useEffect(() => {
    activePeerRef.current = activePeer;
  }, [activePeer]);

  // ── Load current user ──
  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setCurrentUser({ id: d.user.id, name: d.user.name, avatarUrl: d.user.avatar_url });
      })
      .catch(() => {});
  }, []);

  // ── Load Data ──
  const loadPeers = () => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((d) => { if (d.conversations) setPeers(d.conversations); })
      .catch(() => {});
  };

  const loadCommunities = () => {
    fetch("/api/communities")
      .then(r => r.json())
      .then(d => { 
        if (d.communities) {
          setCommunities(d.communities);
          if (!activeCommunity && d.communities.length > 0) {
            openCommunity(d.communities[0]);
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => { 
    loadPeers(); 
    loadCommunities();
  }, []);

  // ── Pusher Real-Time Integration ──
  useEffect(() => {
    if (!currentUser) return;
    
    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = `user-${currentUser.id}`;
    const channel = pusher.subscribe(channelName);
    
    channel.bind('new-message', (msg: Message) => {
      // If viewing the chat with the sender, append instantly
      if (activePeerRef.current && msg.sender_id === activePeerRef.current.peer_id) {
        setMessages(prev => [...prev, msg]);
      }
      // Always refresh peers list to show unread dot/last message
      loadPeers();
    });

    return () => {
      pusher.unsubscribe(channelName);
    };
  }, [currentUser]);

  // ── Load messages for active peer ──
  const loadMessages = (peerId: number) => {
    fetch(`/api/messages/${peerId}`)
      .then((r) => r.json())
      .then((d) => { if (d.messages) setMessages(d.messages); })
      .catch(() => {});
  };

  useEffect(() => {
    if (!activePeer) return;
    loadMessages(activePeer.peer_id);
  }, [activePeer]);

  // ── User Search ──
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setIsSearching(true);
      fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
        .then(r => r.json())
        .then(d => {
          if (d.users) setSearchResults(d.users);
        })
        .finally(() => setIsSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const startNewChat = (user: any) => {
    const existing = peers.find(p => p.peer_id === user.id);
    if (existing) {
      openChat(existing);
    } else {
      const newPeer: Peer = {
        peer_id: user.id,
        peer_name: user.name,
        peer_avatar: user.avatar_url,
        last_message: "Draft...",
        last_message_time: new Date().toISOString(),
        is_read: true
      };
      setPeers(prev => [newPeer, ...prev]);
      openChat(newPeer);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  // ── Scroll to bottom on new messages ──
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ──
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !activePeer || sending) return;
    
    const msgText = newMsg.trim();
    setNewMsg(""); // Optimistic clear
    setSending(true);

    // Optimistic UI append
    if (currentUser) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender_id: currentUser.id,
        receiver_id: activePeer.peer_id,
        content: msgText,
        created_at: new Date().toISOString(),
        is_read: false
      }]);
    }

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiver_id: activePeer.peer_id, content: msgText }),
      });
      if (res.ok) {
        loadPeers();
      }
    } finally {
      setSending(false);
    }
  };

  const openChat = (peer: Peer) => {
    setActivePeer(peer);
    setMessages([]);
    setView("chat");
  };

  // ── Community Actions ──
  const openCommunity = (comm: Community) => {
    setActiveCommunity(comm);
    setView("feed");
    fetch(`/api/communities/${comm.id}/posts`)
      .then(r => r.json())
      .then(d => {
        if (d.posts) {
          setCommunityPosts(d.posts);
          const initialVotes: Record<number, number> = {};
          d.posts.forEach((p: CommunityPost) => initialVotes[p.id] = p.upvotes);
          setVotes(v => ({ ...v, ...initialVotes }));
        }
      });
  };

  const toggleJoinCommunity = async () => {
    if (!activeCommunity) return;
    try {
      const res = await fetch(`/api/communities/${activeCommunity.id}/join`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setActiveCommunity(prev => prev ? { ...prev, is_member: data.joined, member_count: prev.member_count + (data.joined ? 1 : -1) } : null);
        loadCommunities();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommunityName.trim()) return;
    try {
      const res = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCommunityName, description: newCommunityDesc })
      });
      if (res.ok) {
        const data = await res.json();
        setNewCommunityName("");
        setNewCommunityDesc("");
        setShowCreateModal(false);
        loadCommunities();
        openCommunity({ ...data.community, is_member: true, member_count: 1 });
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create community");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !activeCommunity || !activeCommunity.is_member) return;
    
    try {
      const res = await fetch(`/api/communities/${activeCommunity.id}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: postText.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setCommunityPosts(prev => [data.post, ...prev]);
        setVotes(v => ({ ...v, [data.post.id]: data.post.upvotes }));
        setPostText("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVote = (postId: number, dir: "up" | "down") => {
    const prev = voted[postId];
    setVoted((v) => ({ ...v, [postId]: prev === dir ? null : dir }));
    setVotes((v) => ({
      ...v,
      [postId]:
        prev === dir
          ? v[postId] + (dir === "up" ? -1 : 1)
          : (v[postId] || 0) + (dir === "up" ? (prev === "down" ? 2 : 1) : prev === "up" ? -2 : -1),
    }));
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
            <div className="p-5 pb-4 border-b border-stone-200/60">
              <h2 className="font-headline text-base font-bold text-on-surface tracking-tight">Peer Messages</h2>
              <div className="relative mt-3">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">search</span>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search peers by name..." 
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {searchQuery.trim() ? (
                <div className="py-2">
                  {isSearching ? (
                    <p className="text-xs text-center text-stone-400 py-4">Searching...</p>
                  ) : searchResults.length === 0 ? (
                    <p className="text-xs text-center text-stone-400 py-4">No users found.</p>
                  ) : (
                    searchResults.map(user => (
                      <button
                        key={user.id}
                        onClick={() => startNewChat(user)}
                        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white transition-all"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden relative shrink-0">
                          {user.avatar_url ? (
                            <Image fill className="object-cover" src={user.avatar_url} alt={user.name} sizes="40px" />
                          ) : (
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                              {user.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-sm text-stone-900 font-headline truncate block">{user.name}</span>
                          <span className="text-[10px] text-stone-500 truncate block">{user.role || 'Member'}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              ) : peers.length === 0 ? (
                <div className="p-6 text-center text-secondary">
                  <span className="material-symbols-outlined text-3xl block mb-2 text-stone-300">chat_bubble</span>
                  <p className="text-xs">No messages yet.<br />Search above to start!</p>
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
                {!activeCommunity ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 mt-20 text-secondary">
                    <span className="material-symbols-outlined text-6xl text-stone-200 mb-4">groups</span>
                    <p className="font-headline font-bold text-on-surface text-lg mb-1">Select a Community</p>
                    <p className="text-sm text-secondary">Pick a community from the right panel to view posts</p>
                  </div>
                ) : (
                  <div className="max-w-2xl mx-auto py-6 px-6 space-y-6">
                    
                    {/* Community Header */}
                    <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200/60 mb-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-black font-headline text-stone-900 flex items-center gap-2">
                            <span className="text-primary text-2xl leading-none">#</span> {activeCommunity.name}
                          </h2>
                          <p className="text-sm text-stone-600 mt-2">{activeCommunity.description || "A place to learn and share."}</p>
                          <p className="text-xs text-stone-400 mt-2 font-bold uppercase tracking-wider">{activeCommunity.member_count} Members</p>
                        </div>
                        <button 
                          onClick={toggleJoinCommunity}
                          className={`px-4 py-2 rounded-lg text-xs font-bold font-headline uppercase tracking-wider transition-all ${
                            activeCommunity.is_member 
                              ? "bg-stone-200 text-stone-600 hover:bg-red-100 hover:text-red-600"
                              : "bg-primary text-white hover:bg-primary/90"
                          }`}
                        >
                          {activeCommunity.is_member ? "Leave" : "Join"}
                        </button>
                      </div>
                    </div>

                    {/* Compose post */}
                    {activeCommunity.is_member ? (
                      <form onSubmit={handlePost} className="bg-white rounded-2xl border border-stone-200/60 p-4 space-y-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 overflow-hidden relative">
                            {currentUser?.avatarUrl ? (
                              <Image fill className="object-cover" src={currentUser.avatarUrl} alt="" sizes="36px" />
                            ) : (
                              currentUser?.name.charAt(0) ?? "U"
                            )}
                          </div>
                          <textarea
                            value={postText}
                            onChange={(e) => setPostText(e.target.value)}
                            placeholder={`Post something in ${activeCommunity.name}...`}
                            rows={2}
                            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-secondary/60 resize-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
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
                    ) : (
                      <div className="text-center p-4 bg-stone-50 rounded-xl border border-stone-200/60">
                        <p className="text-sm text-stone-500">You must join this community to post.</p>
                      </div>
                    )}

                    {/* Feed posts */}
                    {communityPosts.length === 0 ? (
                      <div className="text-center py-10 text-stone-400">
                        <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                        <p>No posts yet. Be the first to post!</p>
                      </div>
                    ) : (
                      communityPosts.map((post) => (
                        <article key={post.id} className="bg-surface-container-lowest rounded-2xl p-6 border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="relative w-10 h-10 shrink-0">
                              {post.avatar ? (
                                <Image
                                  className="rounded-full object-cover ring-2 ring-white"
                                  fill
                                  src={post.avatar}
                                  alt={post.author}
                                  sizes="40px"
                                />
                              ) : (
                                <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                  {post.author.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-stone-900 font-headline">{post.author}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-orange-50 px-2 py-0.5 rounded">{post.role}</span>
                                <span className="text-[10px] text-stone-400">• {timeAgo(post.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          {post.title && <h3 className="font-headline text-base font-bold mb-2 text-on-surface">{post.title}</h3>}
                          <p className="text-stone-600 leading-relaxed text-sm whitespace-pre-wrap">{post.content}</p>
                          
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
                            </div>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                )}
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
                  </div>
                ) : (
                  <>
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
                                  ? "bg-gradient-to-br from-primary to-primary-container text-white rounded-tr-sm shadow-sm"
                                  : "bg-stone-100 text-stone-800 rounded-tl-sm shadow-sm"
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

          {/* ── RIGHT PANE: Communities ── */}
          <section className="hidden xl:flex w-64 shrink-0 flex-col bg-stone-50 border-l border-stone-200/60">
            <div className="p-5 border-b border-stone-200/60 flex justify-between items-center">
              <h2 className="font-headline text-base font-bold text-on-surface tracking-tight">Communities</h2>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="w-7 h-7 bg-primary text-white flex items-center justify-center rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                title="Create Community"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
            
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {communities.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-4">No communities yet.</p>
              ) : (
                communities.map((comm) => (
                  <button 
                    key={comm.id} 
                    onClick={() => openCommunity(comm)}
                    className={`w-full text-left flex flex-col gap-1 py-2.5 px-3 rounded-xl transition-all group border ${
                      activeCommunity?.id === comm.id 
                        ? 'bg-white border-primary/20 shadow-sm ring-1 ring-primary/10' 
                        : 'bg-transparent border-transparent hover:bg-white hover:border-stone-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        activeCommunity?.id === comm.id ? 'bg-primary text-white' : 'bg-orange-100 text-primary'
                      }`}>
                        <span className="font-black text-sm">#</span>
                      </div>
                      <span className={`font-bold text-sm font-headline truncate ${
                        activeCommunity?.id === comm.id ? 'text-primary' : 'text-stone-700 group-hover:text-stone-900'
                      }`}>
                        {comm.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pl-9">
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{comm.member_count} Members</span>
                      {comm.is_member && <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>

        </main>
      </div>
      
      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black font-headline text-stone-900">Create Community</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-stone-400 hover:text-stone-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateCommunity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-black">#</span>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    value={newCommunityName}
                    onChange={e => setNewCommunityName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))} // No spaces for community names
                    placeholder="react-developers"
                    className="w-full pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold font-headline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-1 pl-1">No spaces allowed. Use hyphens or underscores.</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Description (Optional)</label>
                <textarea
                  maxLength={150}
                  value={newCommunityDesc}
                  onChange={e => setNewCommunityDesc(e.target.value)}
                  placeholder="A place to discuss React, Next.js, and frontend development."
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  rows={3}
                />
              </div>
              
              <button 
                type="submit"
                disabled={!newCommunityName.trim()}
                className="w-full py-3 bg-primary text-white font-bold font-headline rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Create & Join
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => { setView("feed"); document.querySelector('textarea')?.focus(); }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[60]"
      >
        <span className="material-symbols-outlined text-2xl">create</span>
      </button>
    </div>
  );
}
