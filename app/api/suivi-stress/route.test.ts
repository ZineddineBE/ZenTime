import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/prisma/db", () => ({
	prisma: {
		suiviStress: { create: vi.fn() },
		utilisateur: { findUnique: vi.fn() },
	},
}));

import { auth } from "@/auth";
import { prisma } from "@/prisma/db";
import { POST } from "./route";

const authMock = auth as unknown as Mock;
const createMock = prisma.suiviStress.create as unknown as Mock;
const utilisateurFindUniqueMock = prisma.utilisateur.findUnique as unknown as Mock;

function requeteAvecHumeur(body: unknown) {
	return new NextRequest("http://localhost/api/suivi-stress", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
}

beforeEach(() => {
	vi.clearAllMocks();
	utilisateurFindUniqueMock.mockResolvedValue({ consentement_rgpd_utilisateur: true });
});

describe("POST /api/suivi-stress", () => {
	it("renvoie 401 si l'utilisateur n'est pas authentifié", async () => {
		authMock.mockResolvedValue(null);

		const res = await POST(requeteAvecHumeur({ humeur: "zen" }));

		expect(res.status).toBe(401);
		expect(createMock).not.toHaveBeenCalled();
	});

	it("renvoie 403 si l'utilisateur n'a pas donné son consentement RGPD", async () => {
		authMock.mockResolvedValue({ user: { id: "1" } });
		utilisateurFindUniqueMock.mockResolvedValue({ consentement_rgpd_utilisateur: false });

		const res = await POST(requeteAvecHumeur({ humeur: "zen" }));

		expect(res.status).toBe(403);
		expect(createMock).not.toHaveBeenCalled();
	});

	it.each([["invalide"], [undefined], [42]])(
		"renvoie 400 si l'humeur est invalide (%s)",
		async (humeur) => {
			authMock.mockResolvedValue({ user: { id: "1" } });

			const res = await POST(requeteAvecHumeur({ humeur }));

			expect(res.status).toBe(400);
			expect(createMock).not.toHaveBeenCalled();
		},
	);

	it.each([
		["stresse", 9],
		["fatigue", 7],
		["neutre", 5],
		["bien", 3],
		["zen", 1],
	])("enregistre l'humeur « %s » avec le niveau %i", async (humeur, niveau) => {
		authMock.mockResolvedValue({ user: { id: "1" } });
		const suiviCree = {
			id_suivi_stress: 1,
			id_utilisateur: 1,
			niveau_suivi_stress: niveau,
		};
		createMock.mockResolvedValue(suiviCree);

		const res = await POST(requeteAvecHumeur({ humeur }));
		const data = await res.json();

		expect(res.status).toBe(201);
		expect(data).toEqual(suiviCree);
		expect(createMock).toHaveBeenCalledWith({
			data: { id_utilisateur: 1, niveau_suivi_stress: niveau },
		});
	});
});
