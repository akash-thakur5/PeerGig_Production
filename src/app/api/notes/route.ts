import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/demo-auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const notes = await sql`
      SELECT * FROM notes 
      WHERE user_id = ${session.id} 
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ notes });
  } catch (err) {
    console.error('[GET /api/notes]', err);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, subject, tutor_name } = await req.json();

    if (!title || !subject) {
      return NextResponse.json({ error: 'Title and subject are required' }, { status: 400 });
    }

    const [note] = await sql`
      INSERT INTO notes (user_id, title, subject, tutor_name)
      VALUES (${session.id}, ${title}, ${subject}, ${tutor_name ?? null})
      RETURNING *
    `;

    return NextResponse.json({ note });
  } catch (err) {
    console.error('[POST /api/notes]', err);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
