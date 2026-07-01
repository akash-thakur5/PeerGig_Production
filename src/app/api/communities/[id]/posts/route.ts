import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const posts = await sql`
      SELECT p.*, u.name as author, u.avatar_url as avatar, 'Member' as role
      FROM community_posts p
      JOIN users u ON u.id = p.author_id
      WHERE p.community_id = ${parseInt(id)}
      ORDER BY p.created_at DESC
    `;
    return NextResponse.json({ posts });
  } catch (err) {
    console.error('[GET /api/communities/[id]/posts]', err);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { content, title } = await req.json();

    // Verify membership
    const [member] = await sql`SELECT 1 FROM community_members WHERE community_id = ${parseInt(id)} AND user_id = ${parseInt(session.user.id!)}`;
    if (!member) {
      return NextResponse.json({ error: 'You must join the community to post' }, { status: 403 });
    }

    const [post] = await sql`
      INSERT INTO community_posts (community_id, author_id, content, title)
      VALUES (${parseInt(id)}, ${parseInt(session.user.id!)}, ${content}, ${title || null})
      RETURNING *
    `;

    // Fetch the inserted post with author details so the frontend can append it nicely
    const [fullPost] = await sql`
      SELECT p.*, u.name as author, u.avatar_url as avatar, 'Member' as role
      FROM community_posts p
      JOIN users u ON u.id = p.author_id
      WHERE p.id = ${post.id}
    `;

    return NextResponse.json({ post: fullPost }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/communities/[id]/posts]', err);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
