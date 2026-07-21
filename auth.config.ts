import type { NextAuthConfig } from "next-auth";

export const authConfig = {
	pages: {
		signIn: "/login",
	},
	providers: [],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = (user as { id: string }).id;
				token.role = (user as { role: string }).role;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.user.role = token.role as string;
			}
			return session;
		},
	},
} satisfies NextAuthConfig;
