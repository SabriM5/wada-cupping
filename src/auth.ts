import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "CUSTOMER";
    } & DefaultSession["user"];
  }
  interface User {
    role?: "ADMIN" | "CUSTOMER";
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) throw new Error("Identifiants invalides");
        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user) {
          await bcrypt.compare("dummy", "$2a$10$dummyhashdummyhashdummyhashdummy");
          throw new Error("Identifiants invalides");
        }
        const passwordsMatch = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!passwordsMatch) throw new Error("Identifiants invalides");
        return { id: user.id, email: user.email, role: user.role };
      }
    })
  ],
});