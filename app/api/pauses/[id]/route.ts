import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma/db";

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function PATCH(_request: Request, { params }: RouteParams) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
	}

	const { id } = await params;
	const id_pause = Number(id);
	if (!Number.isInteger(id_pause) || id_pause <= 0) {
		return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
	}

	const pause = await prisma.pause.findUnique({ where: { id_pause } });

	if (!pause) {
		return NextResponse.json({ error: "Pause introuvable" }, { status: 404 });
	}

	if (pause.id_utilisateur !== Number(session.user.id)) {
		return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
	}

	if (pause.heure_fin_pause) {
		return NextResponse.json(
			{ error: "Cette pause est déjà terminée" },
			{ status: 409 },
		);
	}

	const pauseTerminee = await prisma.pause.update({
		where: { id_pause },
		data: { heure_fin_pause: new Date() },
	});

	return NextResponse.json(pauseTerminee);
}
