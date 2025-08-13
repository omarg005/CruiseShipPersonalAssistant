import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createJsonRepo } from "@/server/repos/json";

const repo = createJsonRepo();

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Demo Login",
      credentials: { email: { label: "Email", type: "email" } },
      authorize: async (creds) => {
        const email = creds?.email as string | undefined;
        if (!email) return null;
        const account = await repo.getUserAccountByEmail(email);
        if (!account) return null;
        return { id: account.id, email: account.email, name: account.email } as any;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "devsecret",
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        const account = await repo.getUserAccountByEmail(user.email);
        if (account) {
          token.role = account.role;
          token.guestId = account.guestId;
        }
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).user.role = (token as any).role || "guest";
      (session as any).guestId = (token as any).guestId || null;
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

