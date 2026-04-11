import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/demo-auth';

// GET /api/messages — Get list of conversations
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch unique conversation partners and their last message
    const conversations = await sql`
      WITH peer_messages AS (
        SELECT 
          CASE WHEN sender_id = ${session.id} THEN receiver_id ELSE sender_id END AS peer_id,
          content,
          created_at,
          is_read
        FROM messages
        WHERE sender_id = ${session.id} OR receiver_id = ${session.id}
      ),
      latest_messages AS (
        SELECT 
          peer_id,
          content,
          created_at,
          is_read,
          ROW_NUMBER() OVER(PARTITION BY peer_id ORDER BY created_at DESC) as rn
        FROM peer_messages
      )
      SELECT 
        lm.peer_id,
        u.name as peer_name,
        u.avatar_url as peer_avatar,
        lm.content as last_message,
        lm.created_at as last_message_time,
        lm.is_read
      FROM latest_messages lm
      JOIN users u ON u.id = lm.peer_id
      WHERE lm.rn = 1
      ORDER BY lm.created_at DESC
    `;

    return NextResponse.json({ conversations });
  } catch (err) {
    console.error('[GET /api/messages]', err);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

// POST /api/messages — Send a message
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { receiver_id, content } = await req.json();
    if (!receiver_id || !content) {
      return NextResponse.json({ error: 'Receiver and content are required' }, { status: 400 });
    }

    const [message] = await sql`
      INSERT INTO messages (sender_id, receiver_id, content)
      VALUES (${session.id}, ${receiver_id}, ${content})
      RETURNING *
    `;

    return NextResponse.json({ message });
  } catch (err) {
    console.error('[POST /api/messages]', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
