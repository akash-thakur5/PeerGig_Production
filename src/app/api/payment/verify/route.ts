import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import sql from '@/lib/db';
import { auth } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { getBookingPendingTutorHtml, getBookingPendingStudentHtml } from '@/lib/email-templates';

// POST /api/payment/verify — Verify Razorpay payment and create booking
// ESCROW: Student is debited, but tutor is NOT credited until they accept
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      gig_id,
      scheduled_at,
    } = await req.json();

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed — invalid signature' }, { status: 400 });
    }

    // Payment verified! Create the booking
    const [gig] = await sql`
      SELECT g.*, u.name AS tutor_name, u.email AS tutor_email
      FROM gigs g JOIN users u ON u.id = g.tutor_id
      WHERE g.id = ${gig_id}
    `;
    if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 });

    const price = parseFloat(gig.price_per_session);

    // Create booking as pending (tutor still needs to accept)
    const [booking] = await sql`
      INSERT INTO bookings (gig_id, student_id, scheduled_at, status)
      VALUES (${gig_id}, ${parseInt(session.user.id!)}, ${scheduled_at ?? null}, 'pending')
      RETURNING *
    `;

    // ESCROW: Debit student's wallet — money is held by PeerGig
    // Tutor will be credited ONLY when they accept the booking
    await sql`
      INSERT INTO wallet_transactions (user_id, amount, type, description)
      VALUES (${parseInt(session.user.id!)}, ${price}, 'debit', ${'Payment held: ' + gig.title + ' (Order: ' + razorpay_order_id + ')'})
    `;

    // Send emails
    if (gig.tutor_email) {
      await sendEmail({
        to: gig.tutor_email,
        subject: "New Booking Request! 🚀",
        html: getBookingPendingTutorHtml(gig.tutor_name, gig.title)
      }).catch(console.error);
    }
    
    if (session.user.email && session.user.name) {
      await sendEmail({
        to: session.user.email,
        subject: "Payment Verified - Booking Pending ✅",
        html: getBookingPendingStudentHtml(session.user.name, gig.title)
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      booking,
      payment_id: razorpay_payment_id,
      message: 'Payment verified! Awaiting tutor approval.',
    });
  } catch (err) {
    console.error('[POST /api/payment/verify]', err);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
