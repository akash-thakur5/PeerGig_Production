import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/gigs/mine — tutor's own gigs with booking counts
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const gigs = await sql`
      SELECT
        g.*,
        COUNT(b.id) FILTER (WHERE b.status != 'cancelled') AS booking_count
      FROM gigs g
      LEFT JOIN bookings b ON b.gig_id = g.id
      WHERE g.tutor_id = ${parseInt(session.user.id!)}
      GROUP BY g.id
      ORDER BY g.created_at DESC
    `;

    return NextResponse.json({ gigs });
  } catch (err) {
    console.error('[GET /api/gigs/mine]', err);
    return NextResponse.json({ error: 'Failed to fetch your gigs' }, { status: 500 });
  }
}
