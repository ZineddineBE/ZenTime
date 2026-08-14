import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/prisma/db", () => ({
	prisma: {
		pause: { findMany: vi.fn(), create: vi.fn() },
		type: { findUnique: vi.fn() },
		utilisateur: { findUnique: vi.fn() },
	},
}));

import { auth } from "@/auth";
import { prisma } from "@/prisma/db";
import { GET, POST } from "./route";

const authMock = auth as unknown as Mock;
const findManyMock = prisma.pause.findMany as unknown as Mock;
const createMock = prisma.pause.create as unknown as Mock;
const typeFindUniqueMock = prisma.type.findUnique as unknown as Mock;
const utilisateurFindUniqueMock = prisma.utilisateur.findUnique as unknown as Mock;

function requestAvecCorps(body: unknown) {
	return new NextRequest("http://localhost/api/pauses", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
}

beforeEach(() => {
	vi.clearAllMocks();
	// Consenti par défaut : les tests ci-dessous portent sur la logique des
	// pauses elle-même, pas sur la vérification RGPD (testée à part plus bas).
	utilisateurFindUniqueMock.mockResolvedValue({ consentement_rgpd_utilisateur: true });
});

describe("GET /api/pauses", () => {
	it("renvoie 401 si l'utilisateur n'est pas authentifié", async () => {
		authMock.mockResolvedValue(null);

		const res = await GET();

		expect(res.status).toBe(401);
	});

	it("renvoie les pauses du jour de l'utilisateur connecté", async () => {
		authMock.mockResolvedValue({ user: { id: "1" } });
		const pausesFixture = [{ id_pause: 1, id_utilisateur: 1 }];
		findManyMock.mockResolvedValue(pausesFixture);

		const res = await GET();
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual(pausesFixture);
		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ id_utilisateur: 1 }),
			}),
		);
	});
});

describe("POST /api/pauses", () => {
	it("renvoie 401 si l'utilisateur n'est pas authentifié", async () => {
		authMock.mockResolvedValue(null);

		const res = await POST(requestAvecCorps({ id_type: 1 }));

		expect(res.status).toBe(401);
	});

	it("renvoie 403 si l'utilisateur n'a pas donné son consentement RGPD", async () => {
		authMock.mockResolvedValue({ user: { id: "1" } });
		utilisateurFindUniqueMock.mockResolvedValue({ consentement_rgpd_utilisateur: false });

		const res = await POST(requestAvecCorps({ id_type: 1 }));

		expect(res.status).toBe(403);
		expect(createMock).not.toHaveBeenCalled();
	});

	it.each([
		["id_type manquant", {}],
		["id_type non numérique", { id_type: "abc" }],
		["id_type négatif", { id_type: -1 }],
		["id_type nul", { id_type: 0 }],
	])("renvoie 400 si %s", async (_cas, body) => {
		authMock.mockResolvedValue({ user: { id: "1" } });

		const res = await POST(requestAvecCorps(body));

		expect(res.status).toBe(400);
		expect(typeFindUniqueMock).not.toHaveBeenCalled();
	});

	it("renvoie 400 si le type de pause n'existe pas en base", async () => {
		authMock.mockResolvedValue({ user: { id: "1" } });
		typeFindUniqueMock.mockResolvedValue(null);

		const res = await POST(requestAvecCorps({ id_type: 99 }));

		expect(res.status).toBe(400);
		expect(createMock).not.toHaveBeenCalled();
	});

	it("crée la pause et renvoie 201 quand tout est valide", async () => {
		authMock.mockResolvedValue({ user: { id: "1" } });
		typeFindUniqueMock.mockResolvedValue({ id_type: 1 });
		const pauseCreee = { id_pause: 42, id_type: 1, id_utilisateur: 1 };
		createMock.mockResolvedValue(pauseCreee);

		const res = await POST(requestAvecCorps({ id_type: 1 }));
		const data = await res.json();

		expect(res.status).toBe(201);
		expect(data).toEqual(pauseCreee);
		expect(createMock).toHaveBeenCalledWith({
			data: expect.objectContaining({ id_type: 1, id_utilisateur: 1 }),
		});
	});
});
