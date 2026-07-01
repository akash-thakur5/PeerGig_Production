import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import sql from '@/lib/db';
import { auth } from '@/lib/auth';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// POST /api/payment/order — Create a Razorpay order for a gig booking
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { gig_id, scheduled_at } = await req.json();
    if (!gig_id) return NextResponse.json({ error: 'gig_id is required' }, { status: 400 });

    // Get gig details
    const [gig] = await sql`
      SELECT g.*, u.name AS tutor_name
      FROM gigs g JOIN users u ON u.id = g.tutor_id
      WHERE g.id = ${gig_id} AND g.is_active = TRUE
    `;
    if (!gig) return NextResponse.json({ error: 'Gig not found or inactive' }, { status: 404 });

    if (gig.tutor_id === parseInt(session.user.id!)) {
      return NextResponse.json({ error: 'You cannot book your own gig' }, { status: 400 });
    }

    const price = parseFloat(gig.price_per_session);

    // Free gigs — skip payment, create booking directly
    if (price === 0) {
      const [booking] = await sql`
        INSERT INTO bookings (gig_id, student_id, scheduled_at, status)
        VALUES (${gig_id}, ${parseInt(session.user.id!)}, ${scheduled_at ?? null}, 'pending')
        RETURNING *
      `;
      return NextResponse.json({ free: true, booking });
    }

    // Create Razorpay order (amount in paise = INR × 100)
    const order = await razorpay.orders.create({
      amount: Math.round(price * 100),
      currency: 'INR',
      receipt: `peergig_${gig_id}_${parseInt(session.user.id!)}_${Date.now()}`,
      notes: {
        gig_id: String(gig_id),
        student_id: String(parseInt(session.user.id!)),
        scheduled_at: scheduled_at || '',
        gig_title: gig.title,
        tutor_name: gig.tutor_name,
      },
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      gig_title: gig.title,
      tutor_name: gig.tutor_name,
      student_name: session.user.name,
      student_email: session.user.email ?? '',
    });
  } catch (err) {
    console.error('[POST /api/payment/order]', err);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
