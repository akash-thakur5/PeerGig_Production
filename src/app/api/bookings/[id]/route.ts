import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { getBookingConfirmedHtml, getBookingRejectedHtml } from '@/lib/email-templates';

// PATCH /api/bookings/[id] — update booking status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { status, meet_link } = await req.json();

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Fetch booking with gig info to verify ownership
    const [booking] = await sql`
      SELECT b.*, g.tutor_id FROM bookings b JOIN gigs g ON g.id = b.gig_id WHERE b.id = ${parseInt(id)}
    `;
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    // Only the tutor or the student can update
    if (booking.tutor_id !== parseInt(session.user.id!) && booking.student_id !== parseInt(session.user.id!)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [updated] = await sql`
      UPDATE bookings SET
        status    = ${status    ?? booking.status},
        meet_link = ${meet_link ?? booking.meet_link}
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;

    return NextResponse.json({ booking: updated });
  } catch (err) {
    console.error('[PATCH /api/bookings/[id]]', err);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

// PUT /api/bookings/[id] — Accept or Reject a booking request (tutor only)
// On accept: wallet debit student, credit tutor, update total_earned, award swap credits
// On reject: set status to cancelled, no wallet impact
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { action } = await req.json(); // 'accept' or 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Use "accept" or "reject".' }, { status: 400 });
    }

    // Get the booking with gig info
    const [booking] = await sql`
      SELECT b.*, g.tutor_id, g.title AS gig_title, g.price_per_session
      FROM bookings b
      JOIN gigs g ON g.id = b.gig_id
      WHERE b.id = ${parseInt(id)}
    `;

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    // Only the tutor who owns the gig can accept/reject
    if (booking.tutor_id !== parseInt(session.user.id!)) {
      return NextResponse.json({ error: 'You are not the tutor for this gig' }, { status: 403 });
    }

    // Can only accept/reject pending bookings
    if (booking.status !== 'pending') {
      return NextResponse.json({ error: `Booking is already ${booking.status}` }, { status: 400 });
    }

    if (action === 'accept') {
      const price = parseFloat(booking.price_per_session);
      const studentId = booking.student_id;

      // Get student info
      const [student] = await sql`SELECT name, email FROM users WHERE id = ${studentId}`;

      // Update booking status to confirmed
      const [updated] = await sql`
        UPDATE bookings SET status = 'confirmed'
        WHERE id = ${parseInt(id)}
        RETURNING *
      `;

      // Release escrow: credit tutor's wallet (student was already debited at payment time)
      if (price > 0) {
        await sql`
          INSERT INTO wallet_transactions (user_id, amount, type, description)
          VALUES (${parseInt(session.user.id!)}, ${price}, 'credit', ${'Earned: ' + booking.gig_title + ' from ' + (student?.name ?? 'student')})
        `;

        // Update tutor's total_earned
        await sql`
          UPDATE users SET total_earned = total_earned + ${price} WHERE id = ${parseInt(session.user.id!)}
        `;
      }

      // Award student +5 Swap Credits
      await sql`
        UPDATE users SET swap_credits = swap_credits + 5 WHERE id = ${studentId}
      `;

      if (student?.email) {
        await sendEmail({
          to: student.email,
          subject: "Booking Confirmed! 🎉",
          html: getBookingConfirmedHtml(student.name, booking.gig_title)
        }).catch(console.error);
      }

      return NextResponse.json({ booking: updated, message: 'Booking accepted! Payment released to your wallet.' });
    }

    if (action === 'reject') {
      const price = parseFloat(booking.price_per_session);
      const studentId = booking.student_id;

      // Update booking status to cancelled
      const [updated] = await sql`
        UPDATE bookings SET status = 'cancelled'
        WHERE id = ${parseInt(id)}
        RETURNING *
      `;

      // Refund student — money was held, never went to tutor
      if (price > 0) {
        await sql`
          INSERT INTO wallet_transactions (user_id, amount, type, description)
          VALUES (${studentId}, ${price}, 'credit', ${'Refund: ' + booking.gig_title + ' — Rejected by ' + session.user.name})
        `;
      }

      // We need student info to send email
      const [student] = await sql`SELECT name, email FROM users WHERE id = ${studentId}`;
      if (student?.email) {
        await sendEmail({
          to: student.email,
          subject: "Booking Declined",
          html: getBookingRejectedHtml(student.name, booking.gig_title)
        }).catch(console.error);
      }

      return NextResponse.json({ booking: updated, message: 'Booking rejected. Student has been refunded.' });
    }

    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  } catch (err) {
    console.error('[PUT /api/bookings/[id]]', err);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

