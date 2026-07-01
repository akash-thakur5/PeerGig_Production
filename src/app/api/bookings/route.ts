import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/bookings — get bookings for current user (as teacher AND as learner)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Bookings where the user is the gig owner (they are teaching)
    const teachingBookings = await sql`
      SELECT
        b.*,
        g.title      AS gig_title,
        g.subject    AS gig_subject,
        g.price_per_session,
        u.name       AS student_name,
        u.avatar_url AS student_avatar,
        'teaching'   AS booking_role
      FROM bookings b
      JOIN gigs    g ON g.id = b.gig_id
      JOIN users   u ON u.id = b.student_id
      WHERE g.tutor_id = ${parseInt(session.user.id!)}
      ORDER BY b.scheduled_at ASC NULLS LAST, b.created_at DESC
    `;

    // Bookings where the user is the learner (they booked someone else's gig)
    const learningBookings = await sql`
      SELECT
        b.*,
        g.title      AS gig_title,
        g.subject    AS gig_subject,
        g.price_per_session,
        u.name       AS tutor_name,
        u.avatar_url AS tutor_avatar,
        'learning'   AS booking_role
      FROM bookings b
      JOIN gigs    g ON g.id = b.gig_id
      JOIN users   u ON u.id = g.tutor_id
      WHERE b.student_id = ${parseInt(session.user.id!)}
      ORDER BY b.scheduled_at ASC NULLS LAST, b.created_at DESC
    `;

    return NextResponse.json({ teachingBookings, learningBookings });
  } catch (err) {
    console.error('[GET /api/bookings]', err);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

// POST /api/bookings — book a session (any student can book any other student's gig)
// Creates as 'pending' — tutor must ACCEPT before wallet is charged
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { gig_id, scheduled_at } = await req.json();
    if (!gig_id) return NextResponse.json({ error: 'gig_id is required' }, { status: 400 });

    // Get the gig to make sure it exists and is active
    const [gig] = await sql`SELECT * FROM gigs WHERE id = ${gig_id} AND is_active = TRUE`;
    if (!gig) return NextResponse.json({ error: 'Gig not found or inactive' }, { status: 404 });

    // Can't book your own gig
    if (gig.tutor_id === parseInt(session.user.id!)) {
      return NextResponse.json({ error: 'You cannot book your own gig' }, { status: 400 });
    }

    // Check learner has enough balance (pre-check only — actual charge on accept)
    const price = parseFloat(gig.price_per_session);
    if (price > 0) {
      const transactions = await sql`
        SELECT type, amount FROM wallet_transactions WHERE user_id = ${parseInt(session.user.id!)}
      `;
      const credits = transactions.filter((t) => t.type === 'credit').reduce((s: number, t) => s + parseFloat(t.amount), 0);
      const debits  = transactions.filter((t) => t.type === 'debit').reduce((s: number, t) => s + parseFloat(t.amount), 0);
      const balance = credits - debits;

      if (balance < price) {
        return NextResponse.json({
          error: `Insufficient wallet balance. You need ₹${price.toFixed(0)} but have ₹${balance.toFixed(0)}. Please add money to your wallet first.`
        }, { status: 400 });
      }
    }

    const [booking] = await sql`
      INSERT INTO bookings (gig_id, student_id, scheduled_at, status)
      VALUES (${gig_id}, ${parseInt(session.user.id!)}, ${scheduled_at ?? null}, 'pending')
      RETURNING *
    `;

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/bookings]', err);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
