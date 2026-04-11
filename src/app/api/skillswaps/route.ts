import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/demo-auth';

// GET /api/skillswaps — Fetch active skill offers in the marketplace
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const offers = await sql`
      SELECT 
        s.*,
        u.name as user_name,
        u.avatar_url as user_avatar,
        u.rating as user_rating
      FROM skill_offers s
      JOIN users u ON u.id = s.user_id
      WHERE s.is_active = TRUE
      ORDER BY s.created_at DESC
    `;

    return NextResponse.json({ offers });
  } catch (err) {
    console.error('[GET /api/skillswaps]', err);
    return NextResponse.json({ error: 'Failed to fetch skill offers' }, { status: 500 });
  }
}

// POST /api/skillswaps — Publish a new skill offer
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { skill_have, skill_want, description, timing_slots } = await req.json();

    if (!skill_have || !skill_want) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [offer] = await sql`
      INSERT INTO skill_offers (user_id, skill_have, skill_want, description, timing_slots)
      VALUES (${session.id}, ${skill_have}, ${skill_want}, ${description || ''}, ${timing_slots || '{}'})
      RETURNING *
    `;

    return NextResponse.json({ offer }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/skillswaps]', err);
    return NextResponse.json({ error: 'Failed to create skill offer' }, { status: 500 });
  }
}
