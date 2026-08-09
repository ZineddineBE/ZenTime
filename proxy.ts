import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth((req) => {
	const isLoggedIn = !!req.auth;
	const { pathname } = req.nextUrl;
	const role = req.auth?.user?.role;

	if (pathname.startsWith("/login")) {
		if (isLoggedIn) {
			return Response.redirect(new URL("/", req.nextUrl));
		}
		return;
	}

	if (!isLoggedIn) {
		return Response.redirect(new URL("/login", req.nextUrl));
	}

	const estAdmin = role === "Administrateur";

	if (pathname.startsWith("/manager") && role !== "Manager" && !estAdmin) {
		return Response.redirect(new URL("/dashboard", req.nextUrl));
	}

	if (pathname.startsWith("/rh") && role !== "Responsable RH" && !estAdmin) {
		return Response.redirect(new URL("/dashboard", req.nextUrl));
	}
});

export const config = {
	// route publique
	matcher: [
		"/((?!api|api-docs.html|openapi.yaml|scalar/|_next/static|_next/image|favicon.ico).*)",
	],
};
