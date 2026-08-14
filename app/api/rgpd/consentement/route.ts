import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma/db";

/** Enregistre le consentement RGPD explicite de l'utilisateur connecté. */
export async function POST() {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
	}

	const utilisateur = await prisma.utilisateur.update({
		where: { id_utilisateur: Number(session.user.id) },
		data: { consentement_rgpd_utilisateur: true },
		select: { consentement_rgpd_utilisateur: true },
	});

	return NextResponse.json(utilisateur);
}
