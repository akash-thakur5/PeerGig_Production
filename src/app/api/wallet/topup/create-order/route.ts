import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount } = await req.json(); // amount in INR
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 100) {
      return NextResponse.json({ error: 'Minimum top-up is ₹100' }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!
    });

    // Create an order (amount is in paise)
    const options = {
      amount: Math.round(numAmount * 100),
      currency: 'INR',
      receipt: `receipt_topup_${session.user.id}_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ order });
  } catch (err) {
    console.error('[POST /api/wallet/topup/create-order]', err);
    return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 });
  }
}
