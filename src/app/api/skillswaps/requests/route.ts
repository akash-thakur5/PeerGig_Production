import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/skillswaps/requests — Fetch negotiations (incoming/outgoing) for the user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const requests = await sql`
      SELECT 
        r.*,
        o.skill_have as offer_skill_have,
        o.skill_want as offer_skill_want,
        u_init.name as initiator_name,
        u_init.avatar_url as initiator_avatar,
        u_recv.name as receiver_name,
        u_recv.avatar_url as receiver_avatar
      FROM skillswap_requests r
      JOIN skill_offers o ON o.id = r.skill_offer_id
      JOIN users u_init ON u_init.id = r.initiator_id
      JOIN users u_recv ON u_recv.id = r.receiver_id
      WHERE r.initiator_id = ${parseInt(session.user.id!)} OR r.receiver_id = ${parseInt(session.user.id!)}
      ORDER BY r.created_at DESC
    `;

    return NextResponse.json({ requests });
  } catch (err) {
    console.error('[GET /api/skillswaps/requests]', err);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

// POST /api/skillswaps/requests — Propose a swap
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { skill_offer_id, initiator_skill_offered, initiator_slot_choice } = await req.json();

    if (!skill_offer_id || !initiator_skill_offered) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Check if user has enough swap credits (Cost: 10)
    const [user] = await sql`SELECT swap_credits FROM users WHERE id = ${parseInt(session.user.id!)}`;
    if (!user || user.swap_credits < 10) {
      return NextResponse.json({ 
        error: `Insufficient Swap Credits. You need 10 credits to propose a swap (Current: ${user?.swap_credits || 0}). Attend paid gigs to earn more!` 
      }, { status: 403 });
    }

    // 2. Get the offer to find the receiver_id
    const [offer] = await sql`SELECT user_id FROM skill_offers WHERE id = ${skill_offer_id}`;
    if (!offer) return NextResponse.json({ error: 'Skill offer not found' }, { status: 404 });
    
    if (offer.user_id === parseInt(session.user.id!)) {
      return NextResponse.json({ error: 'You cannot swap with yourself' }, { status: 400 });
    }

    // 3. Deduct 10 credits and create request in a transaction
    const [request] = await sql.begin(async (sql) => {
      await sql`UPDATE users SET swap_credits = swap_credits - 10 WHERE id = ${parseInt(session.user.id!)}`;
      
      const [res] = await sql`
        INSERT INTO skillswap_requests (initiator_id, receiver_id, skill_offer_id, initiator_skill_offered, status, initiator_slot_choice)
        VALUES (${parseInt(session.user.id!)}, ${offer.user_id}, ${skill_offer_id}, ${initiator_skill_offered}, 'pending', ${initiator_slot_choice || null})
        RETURNING *
      `;
      return [res];
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/skillswaps/requests]', err);
    return NextResponse.json({ error: 'Failed to propose swap' }, { status: 500 });
  }
}
