import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    if (!q || q.length < 1) {
      return NextResponse.json({ users: [] });
    }

    // Search by name or email, excluding the current user
    const users = await sql`
      SELECT id, name, avatar_url, bio, role
      FROM users
      WHERE id != ${parseInt(session.user.id!)}
        AND (name ILIKE ${'%' + q + '%'} OR email ILIKE ${'%' + q + '%'})
      LIMIT 10
    `;

    return NextResponse.json({ users });
  } catch (err) {
    console.error('[GET /api/users/search]', err);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
}
