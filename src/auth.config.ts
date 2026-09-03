import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 }, // Expiration : 24h
  pages: { signIn: "/connexion" },
  providers: [], // Laissé vide ici exprès pour le Edge Runtime
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "CUSTOMER";
      }
      return session;
    }
  }
} satisfies NextAuthConfig;