import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

vi.mock("@/prisma/db", () => ({
	prisma: { utilisateur: { findUnique: vi.fn() } },
}));

import { prisma } from "@/prisma/db";
import { aConsenti } from "./rgpd";

const findUniqueMock = prisma.utilisateur.findUnique as unknown as Mock;

beforeEach(() => {
	vi.clearAllMocks();
});

describe("aConsenti", () => {
	it("renvoie true si l'utilisateur a consenti", async () => {
		findUniqueMock.mockResolvedValue({ consentement_rgpd_utilisateur: true });

		expect(await aConsenti(1)).toBe(true);
	});

	it("renvoie false si l'utilisateur n'a pas consenti (ou n'existe pas)", async () => {
		findUniqueMock.mockResolvedValue(null);

		expect(await aConsenti(999)).toBe(false);
	});
});
