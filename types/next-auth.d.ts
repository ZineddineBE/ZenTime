import { DefaultSession } from "next-auth";

declare module "next-auth" {
	/**
	 * Étend le type `User` retourné par `authorize()`
	 */
	interface User {
		role?: string;
	}

	/**
	 * Étend la structure de `session.user` dans `auth()` / `useSession()`
	 */
	interface Session {
		user?: {
			id?: string;
			role?: string;
		} & DefaultSession["user"];
	}
}

declare module "next-auth/jwt" {
	/**
	 * Étend le token JWT retourné dans le callback `jwt`
	 */
	interface JWT {
		id?: string;
		role?: string;
	}
}
