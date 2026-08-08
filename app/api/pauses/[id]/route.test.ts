import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/prisma/db", () => ({
	prisma: {
		pause: { findUnique: vi.fn(), update: vi.fn() },
	},
}));

import { auth } from "@/auth";
import { prisma } from "@/prisma/db";
import { PATCH } from "./route";

const authMock = auth as unknown as Mock;
const findUniqueMock = prisma.pause.findUnique as unknown as Mock;
const updateMock = prisma.pause.update as unknown as Mock;

function contexte(id: string) {
	return { params: Promise.resolve({ id }) };
}

const requeteVide = new Request("http://localhost/api/pauses/1", { method: "PATCH" });

beforeEach(() => {
	vi.clearAllMocks();
});

describe("PATCH /api/pauses/[id]", () => {
	it("renvoie 401 si l'utilisateur n'est pas authentifié", async () => {
		authMock.mockResolvedValue(null);

		const res = await PATCH(requeteVide, contexte("1"));

		expect(res.status).toBe(401);
	});

	it("renvoie 400 si l'identifiant est invalide", async () => {
		authMock.mockResolvedValue({ user: { id: "1" } });

		const res = await PATCH(requeteVide, contexte("abc"));

		expect(res.status).toBe(400);
		expect(findUniqueMock).not.toHaveBeenCalled();
	});

	it("renvoie 404 si la pause n'existe pas", async () => {
		authMock.mockResolvedValue({ user: { id: "1" } });
		findUniqueMock.mockResolvedValue(null);

		const res = await PATCH(requeteVide, contexte("1"));

		expect(res.status).toBe(404);
	});

	it("renvoie 403 si la pause appartient à un autre utilisateur", async () => {
		authMock.mockResolvedValue({ user: { id: "1" } });
		findUniqueMock.mockResolvedValue({
			id_pause: 1,
			id_utilisateur: 2,
			heure_fin_pause: null,
		});

		const res = await PATCH(requeteVide, contexte("1"));

		expect(res.status).toBe(403);
		expect(updateMock).not.toHaveBeenCalled();
	});

	it("renvoie 409 si la pause est déjà terminée", async () => {
		authMock.mockResolvedValue({ user: { id: "1" } });
		findUniqueMock.mockResolvedValue({
			id_pause: 1,
			id_utilisateur: 1,
			heure_fin_pause: new Date(),
		});

		const res = await PATCH(requeteVide, contexte("1"));

		expect(res.status).toBe(409);
		expect(updateMock).not.toHaveBeenCalled();
	});

	it("termine la pause et renvoie 200 quand tout est valide", async () => {
		authMock.mockResolvedValue({ user: { id: "1" } });
		findUniqueMock.mockResolvedValue({
			id_pause: 1,
			id_utilisateur: 1,
			heure_fin_pause: null,
		});
		const pauseMaj = { id_pause: 1, id_utilisateur: 1, heure_fin_pause: new Date() };
		updateMock.mockResolvedValue(pauseMaj);

		const res = await PATCH(requeteVide, contexte("1"));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data.id_pause).toBe(1);
		expect(updateMock).toHaveBeenCalledWith({
			where: { id_pause: 1 },
			data: { heure_fin_pause: expect.any(Date) },
		});
	});
});
