import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/gigs/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [gig] = await sql`
      SELECT
        g.*,
        u.name       AS tutor_name,
        u.avatar_url AS tutor_avatar,
        u.rating     AS tutor_rating,
        u.bio        AS tutor_bio
      FROM gigs g
      JOIN users u ON u.id = g.tutor_id
      WHERE g.id = ${parseInt(id)} AND g.is_active = TRUE
    `;
    if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    return NextResponse.json({ gig });
  } catch (err) {
    console.error('[GET /api/gigs/[id]]', err);
    return NextResponse.json({ error: 'Failed to fetch gig' }, { status: 500 });
  }
}

// PUT /api/gigs/[id] — update gig (owner only)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { title, description, subject, price_per_session, tags, timing_slots, is_active } = body;

    const [existing] = await sql`SELECT * FROM gigs WHERE id = ${parseInt(id)}`;
    if (!existing) return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    if (existing.tutor_id !== parseInt(session.user.id!)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [updated] = await sql`
      UPDATE gigs SET
        title             = ${title ?? existing.title},
        description       = ${description ?? existing.description},
        subject           = ${subject ?? existing.subject},
        price_per_session = ${price_per_session ?? existing.price_per_session},
        tags              = ${sql.array(tags ?? existing.tags)},
        timing_slots      = ${timing_slots ? sql.array(timing_slots) : existing.timing_slots},
        is_active         = ${is_active ?? existing.is_active}
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;

    return NextResponse.json({ gig: updated });
  } catch (err) {
    console.error('[PUT /api/gigs/[id]]', err);
    return NextResponse.json({ error: 'Failed to update gig' }, { status: 500 });
  }
}

// DELETE /api/gigs/[id] — hard delete
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const [existing] = await sql`SELECT tutor_id FROM gigs WHERE id = ${parseInt(id)}`;
    if (!existing) return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    if (existing.tutor_id !== parseInt(session.user.id!)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await sql`DELETE FROM gigs WHERE id = ${parseInt(id)}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/gigs/[id]]', err);
    return NextResponse.json({ error: 'Failed to delete gig' }, { status: 500 });
  }
}
