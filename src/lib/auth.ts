import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import sql from "./db";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email as string;
        const password = credentials.password as string;

        const users = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (users.length === 0) return null;

        const user = users[0];
        if (!user.password_hash) return null;

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          image: user.avatar_url,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const { email, name, image } = user;
        if (!email) return false;

        // Check if user exists
        const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`;
        
        if (existingUser.length === 0) {
          // Insert new Google user
          const [newUser] = await sql`
            INSERT INTO users (name, email, avatar_url, role)
            VALUES (${name || 'Google User'}, ${email}, ${image || ''}, 'student')
            RETURNING id
          `;
          user.id = String(newUser.id);
        } else {
          user.id = String(existingUser[0].id);
        }
      }
      return true;
    },
  },
});
