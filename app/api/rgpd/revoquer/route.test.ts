import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/prisma/db", () => ({
	prisma: {
		pause: { deleteMany: vi.fn() },
		suiviStress: { deleteMany: vi.fn() },
		utilisateur: { update: vi.fn(), delete: vi.fn() },
		$transaction: vi.fn((operations: unknown[]) => Promise.all(operations)),
	},
}));

import { auth } from "@/auth";
import { prisma } from "@/prisma/db";
import { POST } from "./route";

const authMock = auth as unknown as Mock;
const deletePausesMock = prisma.pause.deleteMany as unknown as Mock;
const deleteSuiviStressMock = prisma.suiviStress.deleteMany as unknown as Mock;
const updateMock = prisma.utilisateur.update as unknown as Mock;
const deleteUtilisateurMock = prisma.utilisateur.delete as unknown as Mock;
const transactionMock = prisma.$transaction as unknown as Mock;

beforeEach(() => {
	vi.clearAllMocks();
	transactionMock.mockImplementation((operations: unknown[]) => Promise.all(operations));
	deletePausesMock.mockResolvedValue({ count: 0 });
	deleteSuiviStressMock.mockResolvedValue({ count: 0 });
	updateMock.mockResolvedValue({ consentement_rgpd_utilisateur: false });
});

describe("POST /api/rgpd/revoquer", () => {
	it("renvoie 401 si l'utilisateur n'est pas authentifié", async () => {
		authMock.mockResolvedValue(null);

		const res = await POST();

		expect(res.status).toBe(401);
		expect(transactionMock).not.toHaveBeenCalled();
	});

	it("révoque le consentement et supprime définitivement l'historique personnel (pauses, suivi de stress)", async () => {
		authMock.mockResolvedValue({ user: { id: "1" } });

		const res = await POST();
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual({ consentement_rgpd_utilisateur: false });
		expect(deletePausesMock).toHaveBeenCalledWith({ where: { id_utilisateur: 1 } });
		expect(deleteSuiviStressMock).toHaveBeenCalledWith({ where: { id_utilisateur: 1 } });
		expect(updateMock).toHaveBeenCalledWith({
			where: { id_utilisateur: 1 },
			data: { consentement_rgpd_utilisateur: false },
			select: { consentement_rgpd_utilisateur: true },
		});
	});

	it("ne supprime jamais le compte utilisateur lui-même (annuaire géré par les admins, pas une donnée de bien-être)", async () => {
		authMock.mockResolvedValue({ user: { id: "1" } });

		await POST();

		expect(deleteUtilisateurMock).not.toHaveBeenCalled();
	});
});
