import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    // Include member count and a boolean if current user is a member
    const session = await auth();
    let userId = 0;
    if (session?.user) userId = parseInt(session.user.id!);

    const communities = await sql`
      SELECT c.*, 
             (SELECT COUNT(*) FROM community_members WHERE community_id = c.id)::int as member_count,
             EXISTS(SELECT 1 FROM community_members WHERE community_id = c.id AND user_id = ${userId}) as is_member
      FROM communities c
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ communities });
  } catch (err) {
    console.error('[GET /api/communities]', err);
    return NextResponse.json({ error: 'Failed to fetch communities' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, description } = await req.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const [community] = await sql`
      INSERT INTO communities (name, description, creator_id)
      VALUES (${name}, ${description}, ${parseInt(session.user.id!)})
      RETURNING *
    `;

    // Automatically join the creator
    await sql`
      INSERT INTO community_members (community_id, user_id)
      VALUES (${community.id}, ${parseInt(session.user.id!)})
    `;

    return NextResponse.json({ community }, { status: 201 });
  } catch (err: any) {
    if (err.code === '23505') { // Unique violation
      return NextResponse.json({ error: 'Community with this name already exists' }, { status: 409 });
    }
    console.error('[POST /api/communities]', err);
    return NextResponse.json({ error: 'Failed to create community' }, { status: 500 });
  }
}
