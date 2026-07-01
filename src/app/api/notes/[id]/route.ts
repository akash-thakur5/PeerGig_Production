import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    
    // Only the creator of the note can delete it
    const [note] = await sql`SELECT user_id FROM notes WHERE id = ${parseInt(id)}`;
    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    
    if (note.user_id !== parseInt(session.user.id!)) {
      return NextResponse.json({ error: 'Forbidden. You can only delete your own notes.' }, { status: 403 });
    }

    await sql`DELETE FROM notes WHERE id = ${parseInt(id)}`;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/notes/[id]]', err);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
