import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/demo-auth';

// GET /api/wallet — balance + transaction history
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const transactions = await sql`
      SELECT * FROM wallet_transactions
      WHERE user_id = ${session.id}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    const credits = transactions
      .filter((t) => t.type === 'credit')
      .reduce((s: number, t) => s + parseFloat(t.amount), 0);

    const debits = transactions
      .filter((t) => t.type === 'debit')
      .reduce((s: number, t) => s + parseFloat(t.amount), 0);

    const balance = credits - debits;

    // teaching credits (from "Earned:" or Razorpay earned)
    const teachingEarned = transactions
      .filter((t) => t.type === 'credit' && (t.description?.startsWith('Earned:') || t.description?.includes('Razorpay')))
      .reduce((s: number, t) => s + parseFloat(t.amount), 0);

    // learning debits (from "Paid:" or "Razorpay Payment:")
    const learningSpent = transactions
      .filter((t) => t.type === 'debit' && (t.description?.startsWith('Paid:') || t.description?.startsWith('Razorpay Payment:')))
      .reduce((s: number, t) => s + parseFloat(t.amount), 0);

    // refunds received
    const refundsReceived = transactions
      .filter((t) => t.type === 'credit' && t.description?.startsWith('Refund:'))
      .reduce((s: number, t) => s + parseFloat(t.amount), 0);

    return NextResponse.json({ balance, credits, debits, teachingEarned, learningSpent, refundsReceived, transactions });
  } catch (err) {
    console.error('[GET /api/wallet]', err);
    return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
  }
}

// POST /api/wallet — add money (top-up)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount, method } = await req.json();
    const numAmount = parseFloat(amount);

    if (!numAmount || numAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    if (numAmount < 100) {
      return NextResponse.json({ error: 'Minimum top-up is ₹100' }, { status: 400 });
    }
    if (numAmount > 50000) {
      return NextResponse.json({ error: 'Maximum top-up is ₹50,000 per transaction' }, { status: 400 });
    }

    const paymentMethod = method ?? 'UPI';

    const [transaction] = await sql`
      INSERT INTO wallet_transactions (user_id, amount, type, description)
      VALUES (${session.id}, ${numAmount}, 'credit', ${'Added via ' + paymentMethod})
      RETURNING *
    `;

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/wallet]', err);
    return NextResponse.json({ error: 'Failed to add money' }, { status: 500 });
  }
}
