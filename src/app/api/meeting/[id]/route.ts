import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/meeting/[id] — Get meeting details for a confirmed booking
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const bookingId = parseInt(id);

    // Get booking with gig and user details
    const [booking] = await sql`
      SELECT
        b.id AS booking_id,
        b.status,
        b.scheduled_at,
        b.meet_link,
        g.title AS gig_title,
        g.subject AS gig_subject,
        g.tutor_id,
        tutor.name AS tutor_name,
        b.student_id,
        student.name AS student_name
      FROM bookings b
      JOIN gigs g ON g.id = b.gig_id
      JOIN users tutor ON tutor.id = g.tutor_id
      JOIN users student ON student.id = b.student_id
      WHERE b.id = ${bookingId}
    `;

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Only tutor or student of this booking can access
    if (parseInt(session.user.id!) !== booking.tutor_id && parseInt(session.user.id!) !== booking.student_id) {
      return NextResponse.json({ error: 'You do not have access to this meeting' }, { status: 403 });
    }

    // Only confirmed bookings have a meeting
    if (booking.status !== 'confirmed') {
      return NextResponse.json({
        error: booking.status === 'pending'
          ? 'This booking is still pending tutor approval'
          : 'This booking has been ' + booking.status
      }, { status: 400 });
    }

    // Generate room name from booking
    const roomName = `PeerGig-${booking.booking_id}-${booking.gig_title.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)}`;

    // Determine user role
    const role = parseInt(session.user.id!) === booking.tutor_id ? 'tutor' : 'student';

    return NextResponse.json({
      booking_id: booking.booking_id,
      gig_title: booking.gig_title,
      gig_subject: booking.gig_subject,
      tutor_name: booking.tutor_name,
      student_name: booking.student_name,
      scheduled_at: booking.scheduled_at,
      meet_link: booking.meet_link || `https://meet.jit.si/${roomName}`,
      room_name: roomName,
      role,
      user_name: session.user.name,
    });
  } catch (err) {
    console.error('[GET /api/meeting/[id]]', err);
    return NextResponse.json({ error: 'Failed to load meeting' }, { status: 500 });
  }
}
