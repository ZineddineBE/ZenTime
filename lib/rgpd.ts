import { prisma } from "@/prisma/db";

/**
 * Vérifie le consentement RGPD en base (jamais dans la session/JWT) : si un
 * utilisateur révoque son consentement, la restriction doit s'appliquer
 * immédiatement, pas seulement à sa prochaine connexion.
 */
export async function aConsenti(idUtilisateur: number): Promise<boolean> {
	const utilisateur = await prisma.utilisateur.findUnique({
		where: { id_utilisateur: idUtilisateur },
		select: { consentement_rgpd_utilisateur: true },
	});
	return utilisateur?.consentement_rgpd_utilisateur ?? false;
}
