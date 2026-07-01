import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import sql from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { getWelcomeEmailHtml } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Check if user already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    // Hash the password
    const hash = await bcrypt.hash(password, 12);

    // Default avatar
    const defaultAvatar = "https://i.pravatar.cc/150?u=" + encodeURIComponent(email);

    // Insert user
    const [user] = await sql`
      INSERT INTO users (name, email, password_hash, avatar_url)
      VALUES (${name}, ${email}, ${hash}, ${defaultAvatar})
      RETURNING id, name, email
    `;

    // Send Welcome Email (don't fail request if email fails)
    await sendEmail({
      to: email,
      subject: "Welcome to PeerGig! 🎉",
      html: getWelcomeEmailHtml(name),
    }).catch(console.error);

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
