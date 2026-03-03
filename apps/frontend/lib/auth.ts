import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prismaclient } from "@repo/db/client";
import { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";
import { signinSchema } from "@repo/zod";

const githubclientId = process.env.GitHub_ClientId!;
const githubsecret = process.env.GitHub_ClientSecret!;
const Google_ClientId = process.env.Google_ClientId!;
const google_ClientSecret = process.env.Google_ClientSecret!;

export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: Google_ClientId,
      clientSecret: google_ClientSecret,
    }),
    Github({
      clientId: githubclientId,
      clientSecret: githubsecret,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate credentials with Zod
          const validationResult = signinSchema.safeParse(credentials);

          if (!validationResult.success) {
            throw new Error("Invalid credentials format");
          }

          const { email, password } = validationResult.data;

          // Find user by email
          const user = await prismaclient.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) {
            throw new Error("Invalid email or password");
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) {
            throw new Error("Invalid email or password");
          }

          // Return user object (without password)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.photo,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  callbacks: {
    async jwt({ token, user, profile }) {
      if (user && user.email && user.name) {
        // if user exist in db
        let dbUser = await prismaclient.user.upsert({
          where: {
            email: user.email,
          },
          create: {
            email: user.email,
            name: user.name,
            photo: user.image,
          },
          update: {
            name: user.name as string,
            photo: user.image,
          },
        });

        token.id = dbUser.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id && session.user) {
        // Extend the user object to include id
        (session.user as typeof session.user & { id?: string }).id =
          token.id as string;
      }
      return session;
    },
  },
};
