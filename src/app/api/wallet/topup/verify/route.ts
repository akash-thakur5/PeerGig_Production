import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import sql from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = await req.json();

    const text = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Payment is authentic, insert transaction
    const numAmount = parseFloat(amount);
    const [transaction] = await sql`
      INSERT INTO wallet_transactions (user_id, amount, type, description)
      VALUES (${parseInt(session.user.id!)}, ${numAmount}, 'credit', 'Added via Razorpay')
      RETURNING *
    `;

    return NextResponse.json({ success: true, transaction });
  } catch (err) {
    console.error('[POST /api/wallet/topup/verify]', err);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
