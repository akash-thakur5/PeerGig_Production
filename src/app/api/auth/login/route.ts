import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, encodeSession, SESSION_COOKIE_OPTIONS } from '@/lib/demo-auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = validateCredentials(email, password);

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const encoded = encodeSession(user);

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
    });

    response.cookies.set({
      ...SESSION_COOKIE_OPTIONS,
      value: encoded,
    });

    return response;
  } catch (err) {
    console.error('[auth/login]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
