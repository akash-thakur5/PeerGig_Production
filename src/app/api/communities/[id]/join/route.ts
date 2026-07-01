import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    // Check if already joined
    const [existing] = await sql`
      SELECT 1 FROM community_members WHERE community_id = ${parseInt(id)} AND user_id = ${parseInt(session.user.id!)}
    `;

    if (existing) {
      // Leave community
      await sql`DELETE FROM community_members WHERE community_id = ${parseInt(id)} AND user_id = ${parseInt(session.user.id!)}`;
      return NextResponse.json({ joined: false });
    } else {
      // Join community
      await sql`INSERT INTO community_members (community_id, user_id) VALUES (${parseInt(id)}, ${parseInt(session.user.id!)})`;
      return NextResponse.json({ joined: true });
    }
  } catch (err) {
    console.error('[POST /api/communities/[id]/join]', err);
    return NextResponse.json({ error: 'Failed to toggle community membership' }, { status: 500 });
  }
}
