import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// NextAuth initialise la vérification de session sans bcrypt ni Prisma
export default NextAuth(authConfig).auth((req) => {
	const isLoggedIn = !!req.auth;
	const { pathname } = req.nextUrl;

	if (pathname.startsWith("/login")) {
		if (isLoggedIn) {
			return Response.redirect(new URL("/", req.nextUrl));
		}
		return;
	}

	if (!isLoggedIn) {
		return Response.redirect(new URL("/login", req.nextUrl));
	}
});

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
