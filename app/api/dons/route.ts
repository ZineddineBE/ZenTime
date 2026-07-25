import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma/db";
import { getStripe } from "@/lib/stripe";

const MONTANTS_AUTORISES = [3, 5, 10];

/** Crée une session Stripe Checkout pour un don ponctuel ("offrir un café"). */
export async function POST(request: NextRequest) {
	const body = await request.json().catch(() => null);
	const montant = Number(body?.montant);

	if (!MONTANTS_AUTORISES.includes(montant)) {
		return NextResponse.json(
			{ error: `montant invalide, attendu l'un de : ${MONTANTS_AUTORISES.join(", ")}` },
			{ status: 400 },
		);
	}

	const session = await auth();
	const origin = request.headers.get("origin") ?? process.env.AUTH_URL ?? "http://localhost:3000";

	const checkoutSession = await getStripe().checkout.sessions.create({
		mode: "payment",
		payment_method_types: ["card"],
		line_items: [
			{
				price_data: {
					currency: "eur",
					product_data: { name: "Soutien ZenTime ☕" },
					unit_amount: montant * 100,
				},
				quantity: 1,
			},
		],
		success_url: `${origin}/dashboard?don=succes`,
		cancel_url: `${origin}/dashboard?don=annule`,
	});

	if (!checkoutSession.url) {
		return NextResponse.json(
			{ error: "Impossible de créer la session de paiement" },
			{ status: 500 },
		);
	}

	await prisma.don.create({
		data: {
			montant_centimes: montant * 100,
			stripe_session_id: checkoutSession.id,
			id_utilisateur: session?.user?.id ? Number(session.user.id) : null,
		},
	});

	return NextResponse.json({ url: checkoutSession.url });
}
