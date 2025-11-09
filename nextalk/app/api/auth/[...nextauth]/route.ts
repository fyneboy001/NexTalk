// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) return null;

          const data = await res.json();

          // Return user object with all required fields
          return {
            id: data?.user?.id?.toString(),
            name: data?.user?.name,
            email: data?.user?.email,
            image: data?.user?.image || null,
          };
        } catch (error) {
          console.error("NextAuth authorize error:", error);
          return null;
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log("🔐 SignIn callback triggered");
        console.log("User:", user);
        console.log("Account:", account);

        // Find or create user in database
        let existingUser = await prisma.user.findFirst({
          where: { email: user.email! },
        });

        if (!existingUser) {
          console.log("👤 Creating new user in database");
          existingUser = await prisma.user.create({
            data: {
              name: user.name || "User",
              email: user.email!,
              image: user.image || "",
              password: "", // Empty for OAuth users
            },
          });
        } else {
          console.log("👤 User exists in database:", existingUser.id);

          // Update user image if it changed (for OAuth)
          if (user.image && user.image !== existingUser.image) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { image: user.image },
            });
          }
        }

        // ✅ CRITICAL: Update user object with database ID
        user.id = existingUser.id;
        user.name = existingUser.name;
        user.email = existingUser.email;
        user.image = existingUser.image || user.image;

        console.log("✅ SignIn successful for user:", user.id);
        return true;
      } catch (err) {
        console.error("❌ signIn callback error:", err);
        return false;
      }
    },

    async jwt({ token, user, trigger, session }) {
      console.log("🎫 JWT callback triggered");

      // Initial sign in
      if (user) {
        console.log("📝 Adding user to token:", user.id);
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token.name = session.name;
        token.picture = session.image;
      }

      console.log("Token state:", { id: token.id, email: token.email });
      return token;
    },

    async session({ session, token }) {
      console.log("🎭 Session callback triggered");
      console.log("Token data:", {
        id: token.id,
        email: token.email,
        name: token.name,
        picture: token.picture,
      });

      if (session.user && token) {
        // ✅ CRITICAL: Ensure all user data is in session
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }

      console.log("Session user after update:", {
        id: session.user?.id,
        email: session.user?.email,
        name: session.user?.name,
        image: session.user?.image,
      });

      return session;
    },
  },

  pages: {
    signIn: "/signin",
    error: "/signin",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
