import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma/db";
import bcrypt from "bcrypt";
import { estBloque, enregistrerEchec, reinitialiser } from "./lib/rate-limit";

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

				const email = credentials.email as string;

				// Anti-bruteforce : trop d'échecs récents sur cet email -> on ne
				// tente même pas de vérifier le mot de passe.
				if (estBloque(email)) return null;

				const user = await prisma.utilisateur.findUnique({
					where: { mail_utilisateur: email },
					include: { role: true },
				});

				if (user && user.mdp_utilisateur) {
					const isPasswordCorrect = await bcrypt.compare(
						credentials.password as string,
						user.mdp_utilisateur,
					);

					if (isPasswordCorrect) {
						reinitialiser(email);
						return {
							id: user.id_utilisateur.toString(),
							email: user.mail_utilisateur,
							name: `${user.prenom_utilisateur} ${user.nom_utilisateur}`,
							role: user.role.libelle_role,
						};
					}
				}

				enregistrerEchec(email);
				return null;
			},
		}),
	],
});
