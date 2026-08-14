import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma/db";
import { HUMEURS, type Humeur } from "@/lib/stress";
import { aConsenti } from "@/lib/rgpd";

export async function POST(request: NextRequest) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
	}

	if (!(await aConsenti(Number(session.user.id)))) {
		return NextResponse.json(
			{ error: "Consentement RGPD requis avant de pouvoir enregistrer des données de bien-être" },
			{ status: 403 },
		);
	}

	const body = await request.json().catch(() => null);
	const humeur = body?.humeur;

	if (typeof humeur !== "string" || !(humeur in HUMEURS)) {
		return NextResponse.json(
			{ error: `humeur invalide, attendu l'une de : ${Object.keys(HUMEURS).join(", ")}` },
			{ status: 400 },
		);
	}

	const suivi = await prisma.suiviStress.create({
		data: {
			id_utilisateur: Number(session.user.id),
			niveau_suivi_stress: HUMEURS[humeur as Humeur].niveau,
		},
	});

	return NextResponse.json(suivi, { status: 201 });
}
