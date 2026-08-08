import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/prisma/db", () => ({
	prisma: { don: { updateMany: vi.fn() } },
}));
vi.mock("@/lib/stripe", () => ({ getStripe: vi.fn() }));

import { prisma } from "@/prisma/db";
import { getStripe } from "@/lib/stripe";
import { POST } from "./route";

const donUpdateManyMock = prisma.don.updateMany as unknown as Mock;
const getStripeMock = getStripe as unknown as Mock;
const constructEventMock = vi.fn();

function requeteWebhook(corps: string, signature?: string) {
	return new NextRequest("http://localhost/api/dons/webhook", {
		method: "POST",
		headers: signature ? { "stripe-signature": signature } : {},
		body: corps,
	});
}

beforeEach(() => {
	vi.clearAllMocks();
	vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test_secret");
	getStripeMock.mockReturnValue({ webhooks: { constructEvent: constructEventMock } });
});

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("POST /api/dons/webhook", () => {
	it("renvoie 400 si l'en-tête stripe-signature est absent", async () => {
		const res = await POST(requeteWebhook("{}"));

		expect(res.status).toBe(400);
		expect(constructEventMock).not.toHaveBeenCalled();
	});

	it("renvoie 400 si STRIPE_WEBHOOK_SECRET n'est pas configuré", async () => {
		vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");

		const res = await POST(requeteWebhook("{}", "sig_test"));

		expect(res.status).toBe(400);
		expect(constructEventMock).not.toHaveBeenCalled();
	});

	it("renvoie 400 si la signature Stripe est invalide", async () => {
		constructEventMock.mockImplementation(() => {
			throw new Error("signature invalide");
		});

		const res = await POST(requeteWebhook("{}", "sig_invalide"));

		expect(res.status).toBe(400);
		expect(donUpdateManyMock).not.toHaveBeenCalled();
	});

	it("marque le don comme payé quand l'événement est checkout.session.completed", async () => {
		constructEventMock.mockReturnValue({
			type: "checkout.session.completed",
			data: { object: { id: "cs_test_123" } },
		});
		donUpdateManyMock.mockResolvedValue({ count: 1 });

		const res = await POST(requeteWebhook("{}", "sig_valide"));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual({ received: true });
		expect(donUpdateManyMock).toHaveBeenCalledWith({
			where: { stripe_session_id: "cs_test_123" },
			data: { statut: "paye" },
		});
	});

	it("ignore les événements Stripe qui ne concernent pas un paiement complété", async () => {
		constructEventMock.mockReturnValue({
			type: "payment_intent.created",
			data: { object: { id: "cs_test_999" } },
		});

		const res = await POST(requeteWebhook("{}", "sig_valide"));

		expect(res.status).toBe(200);
		expect(donUpdateManyMock).not.toHaveBeenCalled();
	});
});
