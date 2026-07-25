import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/prisma/db";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
	const corpsBrut = await request.text();
	const signature = request.headers.get("stripe-signature");

	if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
		return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
	}

	let event: Stripe.Event;
	try {
		event = getStripe().webhooks.constructEvent(
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
