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
          const baseUrl = "http://localhost:5000";

          const res = await fetch(`${baseUrl}/api/auth/login`, {
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
            id: String(data?.user?.id),
            name: data?.user?.name || null,
            email: data?.user?.email || null,
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
        console.log("=== SignIn Callback ===");
        console.log("User:", user);
        console.log("Account:", account);

        if (!user.email) {
          console.error("No email provided");
          return false;
        }

        // Find or create user in database
        let existingUser = await prisma.user.findFirst({
          where: { email: user.email },
        });

        if (!existingUser) {
          console.log("Creating new user in database");
          existingUser = await prisma.user.create({
            data: {
              name: user.name || "User",
              email: user.email,
              image: user.image || "",
              password: "", // Empty for OAuth users
            },
          });
          console.log("New user created:", existingUser.id);
        } else {
          console.log("User exists in database:", existingUser.id);

          // Update user image if it changed (for OAuth)
          if (user.image && user.image !== existingUser.image) {
            console.log("Updating user image");
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
        user.image = existingUser.image || null;

        console.log("SignIn successful. User ID:", user.id);
        return true;
      } catch (err) {
        console.error("❌ signIn callback error:", err);
        return false;
      }
    },

    async jwt({ token, user, trigger, session }) {
      console.log("=== JWT Callback ===");

      // Initial sign in - user object is available
      if (user) {
        console.log("Initial sign in - setting token from user");
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        console.log("Token set with ID:", token.id);
      }

      // Handle session updates (e.g., profile updates)
      if (trigger === "update" && session) {
        console.log("Session update triggered");
        token.name = session.name;
        token.picture = session.image;
      }

      console.log("JWT Token state:", {
        id: token.id,
        email: token.email,
        name: token.name,
        hasPicture: !!token.picture,
      });

      return token;
    },

    async session({ session, token }) {
      console.log("=== Session Callback ===");
      console.log("Token received:", {
        id: token.id,
        email: token.email,
        name: token.name,
      });

      // ✅ CRITICAL: Properly map token to session user
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string | null;
        session.user.image = (token.picture as string) || null;
      }

      console.log("Session user final state:", {
        id: session.user?.id,
        email: session.user?.email,
        name: session.user?.name,
        hasImage: !!session.user?.image,
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
