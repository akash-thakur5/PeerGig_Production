"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface MeetingData {
  booking_id: number;
  gig_title: string;
  gig_subject: string;
  tutor_name: string;
  student_name: string;
  scheduled_at: string | null;
  meet_link: string;
  room_name: string;
  role: 'tutor' | 'student';
  user_name: string;
}

export default function MeetingPage() {
  const params = useParams();
  const bookingId = params.id as string;

  const [meeting, setMeeting] = useState<MeetingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(false);
  const [displayName, setDisplayName] = useState('');

  // Device states
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [devicesReady, setDevicesReady] = useState(false);
  const [deviceError, setDeviceError] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  // Load meeting data
  useEffect(() => {
    if (!bookingId) return;
    fetch(`/api/meeting/${bookingId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setMeeting(data);
          setDisplayName(data.user_name || '');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load meeting');
        setLoading(false);
      });
  }, [bookingId]);

  // Start camera preview
  useEffect(() => {
    async function startPreview() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setDevicesReady(true);
      } catch (err) {
        setDeviceError('Camera/Mic access denied. Please allow permissions.');
        setDevicesReady(false);
      }
    }
    if (!joined && meeting) {
      startPreview();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [meeting, joined]);

  // Toggle mic
  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => {
        t.enabled = !t.enabled;
      });
      setMicOn(prev => !prev);
    }
  };

  // Toggle camera
  const toggleCam = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(t => {
        t.enabled = !t.enabled;
      });
      setCamOn(prev => !prev);
    }
  };

  // Join the Jitsi meeting
  const startMeeting = () => {
    if (!meeting) return;

    // Stop preview stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }

    setJoined(true);

    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.onload = () => {
      const api = new (window as any).JitsiMeetExternalAPI('meet.jit.si', {
        roomName: meeting.room_name,
        parentNode: jitsiContainerRef.current,
        width: '100%',
        height: '100%',
        configOverwrite: {
          startWithAudioMuted: !micOn,
          startWithVideoMuted: !camOn,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          toolbarButtons: [
            'microphone', 'camera', 'desktop', 'chat',
            'raisehand', 'participants-pane', 'tileview',
            'select-background', 'fullscreen', 'hangup',
          ],
          enableWelcomePage: false,
          enableClosePage: false,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          BRAND_WATERMARK_LINK: '',
          SHOW_POWERED_BY: false,
          TOOLBAR_ALWAYS_VISIBLE: true,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          DEFAULT_BACKGROUND: '#1b1b1e',
        },
        userInfo: {
          displayName: displayName || meeting.user_name,
        },
      });

      jitsiApiRef.current = api;

      api.addEventListener('readyToClose', () => {
        setJoined(false);
        jitsiApiRef.current = null;
        if (jitsiContainerRef.current) {
          jitsiContainerRef.current.innerHTML = '';
        }
      });
    };
    document.body.appendChild(script);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1b1b1e]">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">sync</span>
          <p className="mt-4 text-white/60">Loading meeting room...</p>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1b1b1e]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-red-400">error</span>
          </div>
          <h1 className="text-2xl font-headline font-bold text-white mb-2">Meeting Not Available</h1>
          <p className="text-white/60 text-sm mb-6">{error || 'Could not load meeting details'}</p>
          <Link href="/student" className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:-translate-y-0.5 transition-all">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ─── Pre-Join Lobby (like prototype) ──────────────────────────────────────────
  if (!joined) {
    return (
      <div className="min-h-screen bg-[#1b1b1e] flex flex-col">
        {/* Top Nav */}
        <header className="h-14 bg-black/40 backdrop-blur-md flex items-center justify-between px-6 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">P</span>
            </div>
            <span className="text-white font-headline font-bold text-sm">PeerGig</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/student" className="text-white/50 text-xs hover:text-white transition-colors">Explore</Link>
            <Link href="/student" className="text-white/50 text-xs hover:text-white transition-colors">Dashboard</Link>
            <Link href="/wallet" className="text-white/50 text-xs hover:text-white transition-colors">Wallet</Link>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

            {/* Left: Controls */}
            <div className="space-y-6">
              {/* Jitsi branding */}
              <div className="flex items-center gap-2 text-white/30">
                <span className="material-symbols-outlined text-xl">videocam</span>
                <span className="text-xs font-semibold tracking-wider uppercase">Powered by Jitsi</span>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-3xl font-headline font-black text-primary mb-2">Join meeting</h1>
                <p className="text-white/70 font-semibold text-lg">{meeting.gig_title}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded-full uppercase tracking-widest">{meeting.gig_subject}</span>
                  <span className="text-white/30 text-xs">•</span>
                  <span className="text-white/40 text-xs">Session #{meeting.booking_id}</span>
                </div>
              </div>

              {/* Participants */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 border-2 border-[#1b1b1e] flex items-center justify-center">
                    <span className="text-[10px] font-black text-green-400">{meeting.tutor_name?.charAt(0)}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 border-2 border-[#1b1b1e] flex items-center justify-center">
                    <span className="text-[10px] font-black text-blue-400">{meeting.student_name?.charAt(0)}</span>
                  </div>
                </div>
                <span className="text-white/40 text-xs">{meeting.tutor_name} & {meeting.student_name}</span>
              </div>

              {/* Name Input */}
              <div>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 text-white placeholder:text-white/30 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              {/* Join Button */}
              <button
                onClick={startMeeting}
                disabled={!displayName.trim()}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-headline font-bold text-base rounded-xl hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0"
              >
                Join meeting
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>

              {/* Device Controls */}
              <div className="flex items-center gap-3">
                {/* Mic Toggle */}
                <button
                  onClick={toggleMic}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                    micOn
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  }`}
                  title={micOn ? 'Mute Mic' : 'Unmute Mic'}
                >
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {micOn ? 'mic' : 'mic_off'}
                  </span>
                  {micOn && <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-[#1b1b1e]" style={{ position: 'relative', top: '-8px', right: '-2px', width: '6px', height: '6px' }}></span>}
                </button>

                {/* Camera Toggle */}
                <button
                  onClick={toggleCam}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                    camOn
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  }`}
                  title={camOn ? 'Turn Off Camera' : 'Turn On Camera'}
                >
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {camOn ? 'videocam' : 'videocam_off'}
                  </span>
                </button>

                {/* Settings */}
                <button className="w-11 h-11 rounded-full bg-white/10 text-white/50 flex items-center justify-center hover:bg-white/20 hover:text-white transition-all" title="Settings">
                  <span className="material-symbols-outlined text-lg">settings</span>
                </button>

                {/* Leave / End */}
                <Link
                  href="/student"
                  className="w-11 h-11 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all"
                  title="Leave"
                >
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>call_end</span>
                </Link>
              </div>

              {/* Device Status */}
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${devicesReady ? 'bg-green-500' : deviceError ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`}></span>
                <span className={`text-xs font-medium ${devicesReady ? 'text-green-400' : deviceError ? 'text-red-400' : 'text-yellow-400'}`}>
                  {devicesReady
                    ? 'Your devices are working properly'
                    : deviceError
                    ? deviceError
                    : 'Checking devices...'}
                </span>
              </div>
            </div>

            {/* Right: Camera Preview */}
            <div className="relative">
              <div className="aspect-[4/3] bg-[#2a2a2e] rounded-2xl overflow-hidden relative border border-white/5 shadow-2xl shadow-black/50">
                {camOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-4">
                      <span className="text-4xl font-black text-white/40">{displayName?.charAt(0)?.toUpperCase() || '?'}</span>
                    </div>
                    <p className="text-white/30 text-sm">Camera is off</p>
                  </div>
                )}

                {/* Overlay badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                    micOn ? 'bg-white/10 text-white/70' : 'bg-red-500/20 text-red-400'
                  }`}>
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>{micOn ? 'mic' : 'mic_off'}</span>
                  </span>
                </div>

                {/* Name tag */}
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <span className="text-white text-sm font-semibold">{displayName || 'You'}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${meeting.role === 'tutor' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {meeting.role === 'tutor' ? 'HOST' : 'STUDENT'}
                  </span>
                </div>
              </div>

              {/* Schedule info below preview */}
              {meeting.scheduled_at && (
                <div className="mt-4 bg-white/5 rounded-xl p-3 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-lg">event</span>
                  <div>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Scheduled</p>
                    <p className="text-white text-xs font-semibold">
                      {new Date(meeting.scheduled_at).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
                      {' • '}
                      {new Date(meeting.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom link */}
        <div className="py-4 text-center border-t border-white/5">
          <Link href="/student" className="text-primary text-sm font-bold hover:underline underline-offset-4">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ─── Active Meeting — Jitsi Embedded ──────────────────────────────────────────
  return (
    <div className="h-screen w-screen bg-[#1b1b1e] flex flex-col">
      {/* Meeting top bar */}
      <div className="h-12 bg-black/50 backdrop-blur-md flex items-center justify-between px-4 z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
            <span className="text-white font-black text-[8px]">P</span>
          </div>
          <span className="text-white font-headline font-bold text-sm">PeerGig</span>
          <span className="text-white/20">|</span>
          <span className="text-white/60 text-xs truncate max-w-[300px]">{meeting.gig_title}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-xs font-bold">LIVE</span>
        </div>
      </div>

      {/* Jitsi container */}
      <div ref={jitsiContainerRef} className="flex-1 w-full" />
    </div>
  );
}
