import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma/db";

export async function GET() {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
	}

	const debutJournee = new Date();
	debutJournee.setHours(0, 0, 0, 0);

	const pauses = await prisma.pause.findMany({
		where: {
			id_utilisateur: Number(session.user.id),
			heure_debut_pause: { gte: debutJournee },
		},
		include: { type_pause: true },
		orderBy: { heure_debut_pause: "desc" },
	});

	return NextResponse.json(pauses);
}

export async function POST(request: NextRequest) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
	}

	const body = await request.json().catch(() => null);
	const id_type = Number(body?.id_type);

	if (!Number.isInteger(id_type) || id_type <= 0) {
		return NextResponse.json(
			{ error: "id_type manquant ou invalide" },
			{ status: 400 },
		);
	}

	const typeExiste = await prisma.type.findUnique({ where: { id_type } });
	if (!typeExiste) {
		return NextResponse.json(
			{ error: "Ce type de pause n'existe pas" },
			{ status: 400 },
		);
	}

	const pause = await prisma.pause.create({
		data: {
			id_type,
			id_utilisateur: Number(session.user.id),
			heure_debut_pause: new Date(),
		},
	});

	return NextResponse.json(pause, { status: 201 });
}
