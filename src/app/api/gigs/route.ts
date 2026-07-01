import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/gigs?q=&subject=&page=1&limit=10&sort=&language=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') ?? '';
    const subject = searchParams.get('subject') ?? '';
    const sort = searchParams.get('sort') ?? 'newest';
    const language = searchParams.get('language') ?? '';
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '10'));
    const offset = (page - 1) * limit;

    let orderBy = sql`g.created_at DESC`;
    if (sort === 'price_low') orderBy = sql`g.price_per_session ASC`;
    else if (sort === 'rating_high') orderBy = sql`u.rating DESC`;
    else if (sort === 'newly_joined') orderBy = sql`u.created_at DESC`;

    const gigs = await sql`
      SELECT
        g.id,
        g.title,
        g.description,
        g.subject,
        g.price_per_session,
        g.tags,
        g.timing_slots,
        g.language,
        g.is_active,
        g.created_at,
        u.id        AS tutor_id,
        u.name      AS tutor_name,
        u.avatar_url AS tutor_avatar,
        u.rating    AS tutor_rating,
        u.created_at AS tutor_joined_at
      FROM gigs g
      JOIN users u ON u.id = g.tutor_id
      WHERE g.is_active = TRUE
        AND (${q} = '' OR g.title ILIKE ${'%' + q + '%'} OR g.description ILIKE ${'%' + q + '%'})
        AND (${subject} = '' OR g.subject ILIKE ${subject})
        AND (${language} = '' OR g.language ILIKE ${language})
      ORDER BY ${orderBy}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [{ count }] = await sql`
      SELECT COUNT(*) FROM gigs g
      JOIN users u ON u.id = g.tutor_id
      WHERE g.is_active = TRUE
        AND (${q} = '' OR g.title ILIKE ${'%' + q + '%'})
        AND (${subject} = '' OR g.subject ILIKE ${subject})
        AND (${language} = '' OR g.language ILIKE ${language})
    `;

    return NextResponse.json({ gigs, total: parseInt(count), page, limit });
  } catch (err) {
    console.error('[GET /api/gigs]', err);
    return NextResponse.json({ error: 'Failed to fetch gigs' }, { status: 500 });
  }
}

// POST /api/gigs — any logged-in student can post a gig (teach what they know)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // On PeerGig, every student can teach — no role restriction

    const body = await req.json();
    const { title, description, subject, price_per_session, tags, timing_slots, language, notes_url, test_solutions_url } = body;

    if (!title || !subject || price_per_session == null) {
      return NextResponse.json({ error: 'title, subject, and price_per_session are required' }, { status: 400 });
    }

    const [gig] = await sql`
      INSERT INTO gigs (tutor_id, title, description, subject, price_per_session, tags, timing_slots, language)
      VALUES (${parseInt(session.user.id!)}, ${title}, ${description ?? ''}, ${subject}, ${price_per_session}, ${sql.array(tags ?? [])}, ${sql.array(timing_slots ?? [])}, ${language ?? 'English'})
      RETURNING *
    `;

    // Automatically create acquired materials for the gig
    if (notes_url) {
      await sql`
        INSERT INTO notes (user_id, title, subject, tutor_name, gig_id, content_url)
        VALUES (${parseInt(session.user.id!)}, ${title + ' - Study Notes'}, ${subject}, ${session.user.name ?? null}, ${gig.id}, ${notes_url})
      `;
    }
    
    if (test_solutions_url) {
      await sql`
        INSERT INTO notes (user_id, title, subject, tutor_name, gig_id, content_url)
        VALUES (${parseInt(session.user.id!)}, ${title + ' - Test Solutions'}, ${subject}, ${session.user.name ?? null}, ${gig.id}, ${test_solutions_url})
      `;
    }

    return NextResponse.json({ gig }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/gigs]', err);
    return NextResponse.json({ error: 'Failed to create gig' }, { status: 500 });
  }
}
