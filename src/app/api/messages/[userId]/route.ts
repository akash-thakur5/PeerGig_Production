import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/demo-auth';

// GET /api/messages/[userId] — Get message thread with a user
export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const peerId = parseInt(params.userId);
    if (!peerId) return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });

    const messages = await sql`
      SELECT * FROM messages
      WHERE 
        (sender_id = ${session.id} AND receiver_id = ${peerId}) OR
        (sender_id = ${peerId} AND receiver_id = ${session.id})
      ORDER BY created_at ASC
    `;

    // Mark messages as read where current user is the receiver
    await sql`
      UPDATE messages 
      SET is_read = TRUE 
      WHERE sender_id = ${peerId} AND receiver_id = ${session.id} AND is_read = FALSE
    `;

    return NextResponse.json({ messages });
  } catch (err) {
    console.error('[GET /api/messages/userId]', err);
    return NextResponse.json({ error: 'Failed to fetch thread' }, { status: 500 });
  }
}
