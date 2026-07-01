import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/lib/auth';

// PATCH /api/skillswaps/requests/[id] — Update status or propose slots
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { action, slot_choice, proposed_slots } = body;

    // 1. Get current request state
    const [request] = await sql`SELECT * FROM skillswap_requests WHERE id = ${id}`;
    if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

    const isInitiator = request.initiator_id === parseInt(session.user.id!);
    const isReceiver = request.receiver_id === parseInt(session.user.id!);

    if (!isInitiator && !isReceiver) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 2. Handle Actions
    if (action === 'accept') {
      if (!isReceiver) return NextResponse.json({ error: 'Only the receiver can accept a request' }, { status: 403 });
      
      const [updated] = await sql`
        UPDATE skillswap_requests 
        SET status = 'scheduled',
            receiver_slot_choice = initiator_slot_choice,
            meet_link = ${'https://meet.google.com/swp-' + Math.random().toString(36).substring(7)}
        WHERE id = ${id}
        RETURNING *
      `;
      return NextResponse.json({ request: updated });
    }

    if (action === 'decline') {
      if (!isReceiver) return NextResponse.json({ error: 'Only the receiver can decline a request' }, { status: 403 });
      
      const [updated] = await sql`
        UPDATE skillswap_requests 
        SET status = 'declined'
        WHERE id = ${id}
        RETURNING *
      `;
      return NextResponse.json({ request: updated });
    }

    // 3. Handle Scheduling (Mutual Opt-in)
    if (action === 'schedule') {
      if (request.status !== 'accepted' && request.status !== 'scheduled') {
        return NextResponse.json({ error: 'Request must be accepted before scheduling' }, { status: 400 });
      }

      // If providing initial slots (Receiver usually does this first)
      if (proposed_slots && Array.isArray(proposed_slots)) {
        const [updated] = await sql`
          UPDATE skillswap_requests 
          SET proposed_slots = ${proposed_slots}
          WHERE id = ${id}
          RETURNING *
        `;
        return NextResponse.json({ request: updated });
      }

      // If choosing a slot
      if (slot_choice) {
        let updateQuery;
        if (isInitiator) {
          updateQuery = sql`UPDATE skillswap_requests SET initiator_slot_choice = ${slot_choice} WHERE id = ${id} RETURNING *`;
        } else {
          updateQuery = sql`UPDATE skillswap_requests SET receiver_slot_choice = ${slot_choice} WHERE id = ${id} RETURNING *`;
        }

        const [tempRequest] = await updateQuery;
        
        // Check for match
        if (tempRequest.initiator_slot_choice && tempRequest.receiver_slot_choice && 
            tempRequest.initiator_slot_choice === tempRequest.receiver_slot_choice) {
          
          const [finalRequest] = await sql`
            UPDATE skillswap_requests 
            SET status = 'scheduled', meet_link = ${'https://meet.google.com/swp-' + Math.random().toString(36).substring(7)}
            WHERE id = ${id}
            RETURNING *
          `;
          return NextResponse.json({ request: finalRequest, matched: true });
        }

        return NextResponse.json({ request: tempRequest, matched: false });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('[PATCH /api/skillswaps/requests/[id]]', err);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}
