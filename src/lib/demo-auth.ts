import { cookies } from 'next/headers';

// ─── Demo Users ────────────────────────────────────────────────────────────────
// These IDs MUST match the seeded user IDs in db/init.sql
// On PeerGig, EVERYONE is a student — you earn by teaching, and learn from others.
export const DEMO_USERS = [
  {
    id: 1,
    email: 'student1@peergig.com',
    password: 'student123',
    name: 'Arjun Mehta',
    role: 'student' as const,
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBLGFj3bFY26EelUWXNFUFVCj3rV7dseE-nG46kvlzbh0hQj_MW-kBUrlBRipo_WQqH3i0wRVg-RecKEHz9ouDcKYuKopt8ZkftCW5lVfNhAMXKIuCuhRoZu4JdGzO-Mq4B6euGNwZgz2CNIoQqqn9oA0X9ATu9bA2tQX5Wj3naOSGNn4vmvxmfHUdsjzktlcXAVi6evVjg7tKA7wofXxOBeoGUI1aJicEu-zuBeozCH2TopgagBaVU0MmtNDTghpU6c976tYBrkJ0',
  },
  {
    id: 2,
    email: 'student2@peergig.com',
    password: 'student456',
    name: 'Priya Sharma',
    role: 'student' as const,
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAkDgGbD1vPmNA7mjkFoI1W1VDDj5Fa2UKVUSuybzRbkisulSDYHvdyyQwZlIi5kU2atWO_jfcxAp5M2A4jl7GTzcFdIM1eNIxvAGs44GSNwsEkBKX6sl6rMVEuiuMZeOukVOHhYtrGPHI8Jvuypz8B6bMbzZSE7qaDSEcilbd6syMS8ZiDOg-rjes_oEHEGYKEf_cePi2pRt1_es20UPgxk47clUv2nZy6Rj0NgxYlQWPHFKp0SZJVqkpn47zWfd400ka8wYhyAyI',
  },
] as const;

export type DemoUser = (typeof DEMO_USERS)[number];
export type Session = { id: number; name: string; email: string; role: string; avatarUrl: string };

const COOKIE_NAME = 'peergig_session';

// ─── Validate credentials ───────────────────────────────────────────────────────
export function validateCredentials(email: string, password: string): DemoUser | null {
  return (
    DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    ) ?? null
  );
}

// ─── Cookie helpers (server-side only) ─────────────────────────────────────────
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, 'base64').toString('utf-8')) as Session;
  } catch {
    return null;
  }
}

export function encodeSession(user: DemoUser): string {
  const payload: Session = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export const SESSION_COOKIE_OPTIONS = {
  name: COOKIE_NAME,
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};
