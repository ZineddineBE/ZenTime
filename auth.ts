import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma/db";
import bcrypt from "bcrypt";

export const { handlers, signIn, signOut, auth } = NextAuth({
	...authConfig,
	providers: [
		Credentials({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) return null;

				const user = await prisma.utilisateur.findUnique({
					where: { mail_utilisateur: credentials.email as string },
				});

				if (user && user.mdp_utilisateur) {
					const isPasswordCorrect = await bcrypt.compare(
						credentials.password as string,
						user.mdp_utilisateur,
					);

					if (isPasswordCorrect) {
						return {
							id: user.id_utilisateur.toString(),
							email: user.mail_utilisateur,
							name: `${user.prenom_utilisateur} ${user.nom_utilisateur}`,
						};
					}
				}

				return null;
			},
		}),
	],
});
