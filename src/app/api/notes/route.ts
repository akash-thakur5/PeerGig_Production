import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = parseInt(session.user.id!);
    const notes = await sql`
      SELECT DISTINCT n.* FROM notes n
      LEFT JOIN bookings b ON n.gig_id = b.gig_id
      WHERE n.user_id = ${userId} 
         OR (b.student_id = ${userId} AND b.status = 'confirmed')
      ORDER BY n.created_at DESC
    `;

    return NextResponse.json({ notes });
  } catch (err) {
    console.error('[GET /api/notes]', err);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, subject, tutor_name, content_url, gig_id } = await req.json();

    if (!title || !subject) {
      return NextResponse.json({ error: 'Title and subject are required' }, { status: 400 });
    }

    const userId = parseInt(session.user.id!);

    const [note] = await sql`
      INSERT INTO notes (user_id, title, subject, tutor_name, content_url, gig_id)
      VALUES (${userId}, ${title}, ${subject}, ${tutor_name ?? null}, ${content_url ?? null}, ${gig_id ? parseInt(gig_id) : null})
      RETURNING *
    `;

    return NextResponse.json({ note });
  } catch (err) {
    console.error('[POST /api/notes]', err);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
