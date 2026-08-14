import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma/db";

/**
 * Droit à l'oubli : révoque le consentement RGPD et supprime définitivement
 * l'historique personnel (pauses, suivis de stress) de l'utilisateur connecté.
 * Le compte lui-même (identifiant, rôle) est conservé : c'est l'annuaire de
 * l'entreprise, géré par les administrateurs, pas une donnée de bien-être.
 */
export async function POST() {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
	}

	const idUtilisateur = Number(session.user.id);

	const [, , utilisateur] = await prisma.$transaction([
		prisma.pause.deleteMany({ where: { id_utilisateur: idUtilisateur } }),
		prisma.suiviStress.deleteMany({ where: { id_utilisateur: idUtilisateur } }),
		prisma.utilisateur.update({
			where: { id_utilisateur: idUtilisateur },
			data: { consentement_rgpd_utilisateur: false },
			select: { consentement_rgpd_utilisateur: true },
		}),
	]);

	return NextResponse.json(utilisateur);
}
