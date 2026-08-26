import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/prisma/db", () => ({
	prisma: {
		utilisateur: { update: vi.fn() },
	},
}));

import { auth } from "@/auth";
import { prisma } from "@/prisma/db";
import { POST } from "./route";

const authMock = auth as unknown as Mock;
const updateMock = prisma.utilisateur.update as unknown as Mock;

beforeEach(() => {
	vi.clearAllMocks();
});

describe("POST /api/rgpd/consentement", () => {
	it("renvoie 401 si l'utilisateur n'est pas authentifié", async () => {
		authMock.mockResolvedValue(null);

		const res = await POST();

		expect(res.status).toBe(401);
		expect(updateMock).not.toHaveBeenCalled();
	});

	it("enregistre le consentement RGPD de l'utilisateur connecté", async () => {
		authMock.mockResolvedValue({ user: { id: "1" } });
		updateMock.mockResolvedValue({ consentement_rgpd_utilisateur: true });

		const res = await POST();
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual({ consentement_rgpd_utilisateur: true });
		expect(updateMock).toHaveBeenCalledWith({
			where: { id_utilisateur: 1 },
			data: { consentement_rgpd_utilisateur: true },
			select: { consentement_rgpd_utilisateur: true },
		});
	});
});
