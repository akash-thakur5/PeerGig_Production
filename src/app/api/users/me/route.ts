import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/users/me — current user profile + stats
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [user] = await sql`SELECT * FROM users WHERE id = ${parseInt(session.user.id!)}`;
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Compute stats
    const [{ active_gigs }] = await sql`
      SELECT COUNT(*) AS active_gigs FROM gigs WHERE tutor_id = ${parseInt(session.user.id!)} AND is_active = TRUE
    `;

    const [{ total_earned }] = await sql`
      SELECT COALESCE(SUM(amount), 0) AS total_earned
      FROM wallet_transactions
      WHERE user_id = ${parseInt(session.user.id!)} AND type = 'credit'
    `;

    return NextResponse.json({
      user: {
        ...user,
        active_gigs: parseInt(active_gigs),
        total_earned: parseFloat(total_earned),
      },
    });
  } catch (err) {
    console.error('[GET /api/users/me]', err);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PATCH /api/users/me — update profile
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, bio, avatar_url } = body;

    // Build update dynamic fields
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Execute update
    const [updatedUser] = await sql`
      UPDATE users 
      SET 
        name = COALESCE(${name}, name),
        bio = COALESCE(${bio}, bio),
        avatar_url = COALESCE(${avatar_url}, avatar_url)
      WHERE id = ${parseInt(session.user.id!)}
      RETURNING *
    `;

    return NextResponse.json({ user: updatedUser });
  } catch (err) {
    console.error('[PATCH /api/users/me]', err);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
