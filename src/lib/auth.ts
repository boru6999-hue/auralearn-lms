import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "./db";
import User from "../models/User";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface User { role: string; }
  interface Session {
    user: { id: string; role: string; } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      async authorize(credentials) {
        try {
          await connectDB();
          const user = await User.findOne({ email: credentials?.email });
          if (!user) return null;
          if (!user.passwordHash) return null;
          const valid = await bcrypt.compare(credentials?.password as string, user.passwordHash);
          if (!valid) return null;
          return {
            id: user._id.toString(),
            name: user.name || user.email,
            email: user.email,
            role: user.role || "student",
            image: user.image || "",
          };
        } catch (e) {
          console.error("Auth error:", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Allow credentials login
      if (account?.provider === "credentials") return true;
      
      // OAuth login
      if (account?.provider === "github" || account?.provider === "google") {
        try {
          await connectDB();
          const existing = await User.findOne({ email: user.email });
          if (!existing) {
            const created = await User.create({
              name: user.name || user.email,
              email: user.email,
              passwordHash: "",
              role: "student",
              image: user.image || "",
            });
            user.id = created._id.toString();
            (user as any).role = "student";
          } else {
            user.id = existing._id.toString();
            (user as any).role = existing.role || "student";
            if ((!existing.image || existing.image.length < 500) && user.image) {
              await User.findByIdAndUpdate(existing._id, { image: user.image });
            }
          }
          return true;
        } catch (e) {
          console.error("OAuth signIn error:", e);
          return true; // Still allow login even if DB fails
        }
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "student";
        token.picture = user.image;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.image = token.picture as string;
      session.user.name = token.name as string;
      session.user.email = token.email as string;
      return session;
    },
  },
  pages: { signIn: "/auth/login" },
  trustHost: true,
}); 