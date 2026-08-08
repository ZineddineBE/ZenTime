import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/prisma/db", () => ({
	prisma: { don: { create: vi.fn() } },
}));
vi.mock("@/lib/stripe", () => ({ getStripe: vi.fn() }));

import { auth } from "@/auth";
import { prisma } from "@/prisma/db";
import { getStripe } from "@/lib/stripe";
import { POST } from "./route";

const authMock = auth as unknown as Mock;
const donCreateMock = prisma.don.create as unknown as Mock;
const getStripeMock = getStripe as unknown as Mock;
const createCheckoutSessionMock = vi.fn();

function requeteDon(body: unknown) {
	return new NextRequest("http://localhost/api/dons", {
		method: "POST",
		headers: { "Content-Type": "application/json", origin: "http://localhost:3000" },
		body: JSON.stringify(body),
	});
}

beforeEach(() => {
	vi.clearAllMocks();
	getStripeMock.mockReturnValue({
		checkout: { sessions: { create: createCheckoutSessionMock } },
	});
});

describe("POST /api/dons", () => {
	it.each([[undefined], [7], ["abc"], [0]])(
		"renvoie 400 si le montant est invalide (%s)",
		async (montant) => {
			const res = await POST(requeteDon({ montant }));

			expect(res.status).toBe(400);
			expect(createCheckoutSessionMock).not.toHaveBeenCalled();
		},
	);

	it("crée une session Stripe Checkout et un Don 'en_attente' pour un utilisateur connecté", async () => {
		authMock.mockResolvedValue({ user: { id: "1" } });
		createCheckoutSessionMock.mockResolvedValue({
			id: "cs_test_123",
			url: "https://checkout.stripe.com/cs_test_123",
		});
		donCreateMock.mockResolvedValue({});

		const res = await POST(requeteDon({ montant: 5 }));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual({ url: "https://checkout.stripe.com/cs_test_123" });

		expect(createCheckoutSessionMock).toHaveBeenCalledWith(
			expect.objectContaining({
				mode: "payment",
				success_url: "http://localhost:3000/dashboard?don=succes",
				cancel_url: "http://localhost:3000/dashboard?don=annule",
				line_items: [
					expect.objectContaining({
						price_data: expect.objectContaining({
							currency: "eur",
							unit_amount: 500,
						}),
					}),
				],
			}),
		);

		expect(donCreateMock).toHaveBeenCalledWith({
			data: {
				montant_centimes: 500,
				stripe_session_id: "cs_test_123",
				id_utilisateur: 1,
			},
		});
	});

	it("autorise un don anonyme (utilisateur non connecté) avec id_utilisateur à null", async () => {
		authMock.mockResolvedValue(null);
		createCheckoutSessionMock.mockResolvedValue({
			id: "cs_test_456",
			url: "https://checkout.stripe.com/cs_test_456",
		});
		donCreateMock.mockResolvedValue({});

		await POST(requeteDon({ montant: 3 }));

		expect(donCreateMock).toHaveBeenCalledWith({
			data: {
				montant_centimes: 300,
				stripe_session_id: "cs_test_456",
				id_utilisateur: null,
			},
		});
	});

	it("renvoie 500 si Stripe ne renvoie pas d'URL de paiement", async () => {
		authMock.mockResolvedValue(null);
		createCheckoutSessionMock.mockResolvedValue({ id: "cs_test_789", url: null });

		const res = await POST(requeteDon({ montant: 10 }));

		expect(res.status).toBe(500);
		expect(donCreateMock).not.toHaveBeenCalled();
	});
});
