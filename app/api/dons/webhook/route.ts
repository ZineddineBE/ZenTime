import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/prisma/db";
import { stripe } from "@/lib/stripe";

/**
 * Endpoint appelé par Stripe (serveur à serveur), pas par le navigateur.
 * La signature garantit que l'événement vient bien de Stripe : c'est la
 * seule preuve fiable qu'un paiement a réellement eu lieu (contrairement
 * à success_url, que n'importe qui peut visiter sans avoir payé).
 */
export async function POST(request: NextRequest) {
	const corpsBrut = await request.text();
	const signature = request.headers.get("stripe-signature");

	if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
		return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
	}

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(
			corpsBrut,
			signature,
			process.env.STRIPE_WEBHOOK_SECRET,
		);
	} catch {
		return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
	}

	if (event.type === "checkout.session.completed") {
		const checkoutSession = event.data.object as Stripe.Checkout.Session;

		await prisma.don.updateMany({
			where: { stripe_session_id: checkoutSession.id },
			data: { statut: "paye" },
		});
	}

	return NextResponse.json({ received: true });
}
