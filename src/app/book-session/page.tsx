"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

interface Gig {
  id: number;
  title: string;
  description: string;
  subject: string;
  price_per_session: string;
  tutor_name: string;
  tutor_avatar: string;
  tutor_rating: string;
  tutor_bio: string;
  tags: string[];
  timing_slots?: string[];
}

function BookSessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const gigId = searchParams.get('gigId');

  const [gig, setGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');


  useEffect(() => {
    if (!gigId) {
      setLoading(false);
      return;
    }
    fetch(`/api/gigs/${gigId}`)
      .then((r) => r.json())
      .then((data) => {
        setGig(data.gig ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [gigId]);

  const [paymentId, setPaymentId] = useState('');

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBook = async () => {
    if (!gigId) return;
    setBooking(true);
    setError('');
    try {
      let finalDateTime = null;
      if (selectedDate && selectedSlot) {
        const timePart = selectedSlot.split('-')[0].trim();
        const d = new Date(`${selectedDate} ${timePart}`);
        if (!isNaN(d.getTime())) finalDateTime = d.toISOString();
      } else if (selectedDate) {
        const d = new Date(selectedDate);
        if (!isNaN(d.getTime())) finalDateTime = d.toISOString();
      } else if (gig?.timing_slots && gig.timing_slots.length > 0) {
        setError('Please select date and time slot');
        setBooking(false);
        return;
      }

      // Step 1: Create Razorpay order via our API
      const orderRes = await fetch('/api/payment/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gig_id: parseInt(gigId),
          scheduled_at: finalDateTime,
        }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        setError(orderData.error ?? 'Failed to create order');
        setBooking(false);
        return;
      }

      // Free gig — booked directly, no payment needed
      if (orderData.free) {
        setBooked(true);
        setBooking(false);
        return;
      }

      // Step 2: Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError('Failed to load payment gateway. Please try again.');
        setBooking(false);
        return;
      }

      // Step 3: Open Razorpay checkout popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'PeerGig',
        description: `Session: ${orderData.gig_title}`,
        order_id: orderData.order_id,
        prefill: {
          name: orderData.student_name,
          email: orderData.student_email || '',
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          paylater: true,
        },
        theme: {
          color: '#904d00',
        },
        handler: async function (response: any) {
          // Step 4: Verify payment on our server
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                gig_id: parseInt(gigId!),
                scheduled_at: finalDateTime,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setPaymentId(response.razorpay_payment_id);
              setBooked(true);
            } else {
              setError(verifyData.error ?? 'Payment verification failed');
            }
          } catch {
            setError('Payment verification failed. Please contact support.');
          }
          setBooking(false);
        },
        modal: {
          ondismiss: function () {
            setBooking(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch {
      setError('Network error — please try again');
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">sync</span>
          <p className="mt-4 text-secondary">Loading gig details...</p>
        </div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-secondary">search_off</span>
          <p className="mt-4 font-headline font-bold text-xl">Gig not found</p>
          <Link href="/student" className="mt-4 inline-block text-primary hover:underline">Browse all gigs</Link>
        </div>
      </div>
    );
  }

  if (booked) {
    const isFree = parseFloat(gig.price_per_session) === 0;
    const now = new Date();
    const txnId = `TXN${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-lg">
          {/* Success Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-4xl text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h1 className="text-3xl font-headline font-black text-on-surface mb-1">
              {isFree ? 'Request Sent!' : 'Payment Successful!'}
            </h1>
            <p className="text-secondary text-sm">
              {isFree ? 'Your booking request has been sent.' : 'Your payment has been processed securely.'}
            </p>
          </div>

          {/* Transaction Receipt Card */}
          <div className="bg-white rounded-2xl border border-surface-container-low shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden">
            {/* Receipt Header */}
            <div className="bg-gradient-to-br from-[#904d00] to-[#ff8c00] px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Transaction Receipt</p>
                <p className="text-white text-lg font-headline font-black mt-0.5">PeerGig</p>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-xs">{now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                <p className="text-white/80 text-xs">{now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            {/* Amount Section */}
            <div className="px-6 py-5 border-b border-dashed border-surface-container-low text-center">
              <p className="text-xs text-secondary uppercase tracking-widest font-bold mb-1">Amount {isFree ? '' : 'Paid'}</p>
              <p className="text-4xl font-black text-on-surface font-headline">
                {isFree ? 'FREE' : `₹${parseFloat(gig.price_per_session).toFixed(0)}`}
              </p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isFree ? 'bg-green-100 text-green-700' : 'bg-green-100 text-green-700'}`}>
                {isFree ? 'No Charge' : 'Payment Completed'}
              </span>
            </div>

            {/* Transaction Details */}
            <div className="px-6 py-5 space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs text-secondary uppercase tracking-widest font-bold">Session</span>
                <span className="text-sm font-semibold text-on-surface text-right max-w-[60%]">{gig.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-secondary uppercase tracking-widest font-bold">Tutor</span>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-[10px] font-black text-primary">{gig.tutor_name?.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-semibold text-on-surface">{gig.tutor_name}</span>
                </div>
              </div>
              {selectedDate && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-secondary uppercase tracking-widest font-bold">Scheduled</span>
                  <span className="text-sm font-semibold text-on-surface">
                    {new Date(selectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {selectedSlot && ` • ${selectedSlot}`}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs text-secondary uppercase tracking-widest font-bold">Subject</span>
                <span className="px-3 py-0.5 bg-primary/5 text-primary text-xs font-bold rounded-full">{gig.subject}</span>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-surface-container-low"></div>

              {paymentId && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-secondary uppercase tracking-widest font-bold">Payment ID</span>
                  <span className="text-xs font-mono font-semibold text-on-surface bg-surface-container-low px-2 py-1 rounded">{paymentId}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs text-secondary uppercase tracking-widest font-bold">Transaction ID</span>
                <span className="text-xs font-mono font-semibold text-on-surface bg-surface-container-low px-2 py-1 rounded">{txnId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-secondary uppercase tracking-widest font-bold">Payment Mode</span>
                <span className="text-sm font-semibold text-on-surface">{isFree ? 'N/A' : 'Razorpay'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-secondary uppercase tracking-widest font-bold">Status</span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                  <span className="material-symbols-outlined text-xs">schedule</span>
                  Pending Tutor Approval
                </span>
              </div>
            </div>

            {/* Footer Note */}
            <div className="px-6 py-4 bg-surface-container-low/30 border-t border-surface-container-low">
              <p className="text-[11px] text-secondary text-center">
                The tutor will review and accept your booking. If rejected, a full refund will be processed to your wallet.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Link href="/student" className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-center hover:-translate-y-0.5 transition-all text-sm">
              Explore More Gigs
            </Link>
            <Link href="/student" className="flex-1 py-3 border border-outline-variant text-secondary rounded-xl font-bold hover:bg-surface-container-low transition-all text-center text-sm">
              View My Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface font-body min-h-screen">
      {/* Nav */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm flex justify-between items-center px-8 h-16">
        <Link href="/" className="text-2xl font-black text-[#1b1b1e] font-headline tracking-tight">PeerGig</Link>
        <Link href="/student" className="flex items-center gap-1 text-sm font-semibold text-secondary hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Gigs
        </Link>
      </header>

      <main className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Gig Info */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">{gig.subject}</span>
              <h1 className="text-3xl font-headline font-black text-on-surface mt-4 leading-tight">{gig.title}</h1>
            </div>

            {/* Tutor Card */}
            <div className="flex items-center gap-4 p-5 bg-surface-container-lowest rounded-2xl border border-surface-container-low">
              <div className="h-14 w-14 rounded-full overflow-hidden relative border-2 border-white shadow">
                {gig.tutor_avatar ? (
                  <Image fill className="object-cover" src={gig.tutor_avatar} alt={gig.tutor_name} />
                ) : (
                  <span className="material-symbols-outlined w-full h-full flex items-center justify-center text-4xl text-secondary">account_circle</span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-on-surface">{gig.tutor_name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-sm text-[#ff8c00]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-xs font-bold text-secondary">{gig.tutor_rating} rating</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {gig.description && (
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-low">
                <h3 className="font-headline font-bold text-lg mb-3">About this Gig</h3>
                <p className="text-secondary leading-relaxed">{gig.description}</p>
              </div>
            )}

            {/* Tutor Bio */}
            {gig.tutor_bio && (
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-low">
                <h3 className="font-headline font-bold text-lg mb-3">About the Tutor</h3>
                <p className="text-secondary leading-relaxed">{gig.tutor_bio}</p>
              </div>
            )}

            {/* Topics Covered */}
            {gig.tags?.length > 0 && (
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-low">
                <div className="flex items-center gap-3 mb-5">
                  <span className="material-symbols-outlined text-primary">list_alt</span>
                  <h3 className="font-headline font-bold text-lg">Topics Covered</h3>
                  <span className="ml-auto text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary px-3 py-1 rounded-full">{gig.tags.length} Topics</span>
                </div>
                <div className="space-y-3">
                  {gig.tags.map((tag, idx) => (
                    <div key={tag} className="flex items-center gap-3 p-3 bg-surface-container-low/50 rounded-xl hover:bg-primary/5 transition-colors group">
                      <span className="w-7 h-7 flex-shrink-0 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-black group-hover:bg-primary group-hover:text-white transition-colors">{idx + 1}</span>
                      <span className="text-sm font-medium text-on-surface">{tag}</span>
                      <span className="material-symbols-outlined text-green-500 text-sm ml-auto flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking Panel */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 bg-white rounded-3xl p-8 border border-surface-container-low shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
              <div className="text-4xl font-black text-primary mb-1">₹{parseFloat(gig.price_per_session).toLocaleString('en-IN')}</div>
              <p className="text-secondary text-sm mb-6">per session</p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2">Choose Date *</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-3 px-2 rounded-t-lg text-sm outline-none transition-all mb-4"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                  
                  {gig.timing_slots && gig.timing_slots.length > 0 ? (
                    <>
                      <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2 mt-4">Choose Timing Slot *</label>
                      <select
                        required
                        className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-3 px-2 rounded-t-lg text-sm outline-none transition-all"
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                      >
                        <option value="" disabled>Select a slot</option>
                        {gig.timing_slots.map((slot, idx) => (
                          <option key={idx} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <>
                      <label className="block text-xs font-bold text-secondary uppercase tracking-widest mt-4 mb-2">Preferred Slot (optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. 10:00 AM - 11:00 AM"
                        className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-3 px-2 rounded-t-lg text-sm outline-none transition-all"
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                      />
                    </>
                  )}
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">error</span>
                  {error}
                </div>
              )}

              <button
                onClick={handleBook}
                disabled={booking}
                className="w-full py-4 bg-gradient-to-br from-[#904d00] to-[#ff8c00] text-white font-headline font-bold text-lg rounded-xl shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60 disabled:translate-y-0"
              >
                {booking ? 'Booking...' : 'Book This Session'}
              </button>

              <p className="text-center text-xs text-secondary mt-4">
                Free cancellation within 24 hours
              </p>

              <div className="mt-6 pt-6 border-t border-surface-container-low space-y-3">
                <div className="flex items-center gap-3 text-sm text-secondary">
                  <span className="material-symbols-outlined text-lg text-primary">verified</span>
                  Peer-verified tutor
                </div>
                <div className="flex items-center gap-3 text-sm text-secondary">
                  <span className="material-symbols-outlined text-lg text-primary">schedule</span>
                  Flexible scheduling
                </div>
                <div className="flex items-center gap-3 text-sm text-secondary">
                  <span className="material-symbols-outlined text-lg text-primary">videocam</span>
                  Live video session
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BookSessionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="material-symbols-outlined text-5xl animate-spin text-primary">sync</span></div>}>
      <BookSessionContent />
    </Suspense>
  );
}
