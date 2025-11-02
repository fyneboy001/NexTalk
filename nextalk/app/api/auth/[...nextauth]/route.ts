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
          // Call your backend login endpoint
          const res = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) return null;

          const user = await res.json();
          // Return the user object for NextAuth session
          return {
            id: user.user.id,
            name: user.user.name,
            email: user.user.email,
            // Optional: include token if needed
            token: user.token,
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
    async signIn({ user, account, profile, email, credentials }) {
      if (account?.provider == "google") {
        const isUser = await prisma.user.findFirst({
          where: { email: user.email! },
        });
        if (isUser) return true;
        await prisma.user.create({
          data: {
            name: user.name!,
            email: user.email!,
            image: user.image!,
            password: "",
          },
        });
      }
      if (account?.provider == "github") {
        const isUser = await prisma.user.findFirst({
          where: { email: user.email! },
        });
        if (isUser) return true;
        await prisma.user.create({
          data: {
            name: user.name!,
            email: user.email!,
            image: user.image!,
            password: "",
          },
        });
      }
      return true;
    },
    // async redirect({ url, baseUrl }) {
    //   return baseUrl;
    // },
    // async session({ session, user, token }) {
    //   return session;
    // },
    // async jwt({ token, user, account, profile, isNewUser }) {
    //   return token;
    // },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET, // must be set in frontend .env
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
