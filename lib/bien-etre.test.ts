import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

vi.mock("@/prisma/db", () => ({
	prisma: {
		utilisateur: { findMany: vi.fn(), count: vi.fn() },
		suiviStress: { findMany: vi.fn() },
		pause: { findMany: vi.fn() },
	},
}));

import { prisma } from "@/prisma/db";
import { classifierRisque, getTeamOverview, getCompanyOverview } from "./bien-etre";

const findManyUtilisateurMock = prisma.utilisateur.findMany as unknown as Mock;
const countUtilisateurMock = prisma.utilisateur.count as unknown as Mock;
const findManySuiviMock = prisma.suiviStress.findMany as unknown as Mock;
const findManyPauseMock = prisma.pause.findMany as unknown as Mock;

beforeEach(() => {
	vi.clearAllMocks();
});

describe("classifierRisque", () => {
	it("renvoie Élevé si le stress moyen atteint le seuil élevé (7)", () => {
		expect(classifierRisque(7, 5)).toBe("Élevé");
		expect(classifierRisque(9, 10)).toBe("Élevé");
	});

	it("renvoie Élevé si les pauses/jour sont inférieures à la moitié du minimum recommandé", () => {
		// PAUSES_MIN_RECOMMANDEES_PAR_JOUR = 3 → seuil critique = 1.5
		expect(classifierRisque(null, 1)).toBe("Élevé");
		expect(classifierRisque(2, 1)).toBe("Élevé");
	});

	it("renvoie Modéré si le stress moyen atteint le seuil modéré (4) sans être élevé", () => {
		expect(classifierRisque(4, 5)).toBe("Modéré");
		expect(classifierRisque(6, 5)).toBe("Modéré");
	});

	it("renvoie Modéré si les pauses/jour sont sous la recommandation sans être critiques", () => {
		expect(classifierRisque(null, 2)).toBe("Modéré");
		expect(classifierRisque(1, 2.9)).toBe("Modéré");
	});

	it("renvoie Faible si le stress est bas et les pauses suffisantes", () => {
		expect(classifierRisque(1, 3)).toBe("Faible");
		expect(classifierRisque(null, 4)).toBe("Faible");
	});
});

describe("getTeamOverview", () => {
	it("interroge les subordonnés directs du manager sur la période demandée", async () => {
		findManyUtilisateurMock.mockResolvedValue([]);

		await getTeamOverview(1, 7);

		expect(findManyUtilisateurMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { id_utilisateur_1: 1 },
				select: expect.objectContaining({
					prenom_utilisateur: true,
					suivis_stress: expect.objectContaining({
						where: { date_suivi_stress: { gte: expect.any(Date) } },
					}),
					pauses: expect.objectContaining({
						where: { heure_debut_pause: { gte: expect.any(Date) } },
					}),
				}),
			}),
		);
	});

	it("n'expose que le prénom (jamais le nom de famille) et calcule le niveau de risque par membre", async () => {
		findManyUtilisateurMock.mockResolvedValue([
			{
				id_utilisateur: 10,
				prenom_utilisateur: "Lucas",
				suivis_stress: [{ niveau_suivi_stress: 8 }, { niveau_suivi_stress: 8 }],
				pauses: [{}, {}, {}, {}, {}, {}, {}], // 7 pauses / 7 jours = 1/jour
			},
			{
				id_utilisateur: 11,
				prenom_utilisateur: "Emma",
				suivis_stress: [],
				pauses: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}], // 3/jour
			},
		]);

		const resultat = await getTeamOverview(1, 7);

		expect(resultat).toEqual([
			{ id: 10, prenom: "Lucas", niveau_risque: "Élevé" }, // stress moyen 8 ≥ 7
			{ id: 11, prenom: "Emma", niveau_risque: "Faible" }, // pas de stress renseigné, 3 pauses/jour
		]);
		// Vérifie qu'aucun champ "nom" n'a été demandé à Prisma (confidentialité).
		const selectArg = findManyUtilisateurMock.mock.calls[0][0].select;
		expect(selectArg).not.toHaveProperty("nom_utilisateur");
	});
});

describe("getCompanyOverview", () => {
	it("masque les statistiques si l'effectif est sous le seuil minimum (5 collaborateurs)", async () => {
		countUtilisateurMock.mockResolvedValue(3);
		findManySuiviMock.mockResolvedValue([{ niveau_suivi_stress: 9 }]);
		findManyPauseMock.mockResolvedValue([{}, {}]);

		const resultat = await getCompanyOverview(30);

		expect(resultat).toEqual({
			periode_jours: 30,
			effectif_suffisant: false,
			total_collaborateurs: null,
			stress_moyen: null,
			pauses_moyennes_par_jour: null,
		});
	});

	it("calcule les moyennes globales quand l'effectif est suffisant", async () => {
		countUtilisateurMock.mockResolvedValue(5);
		findManySuiviMock.mockResolvedValue([
			{ niveau_suivi_stress: 4 },
			{ niveau_suivi_stress: 6 },
		]); // moyenne 5
		findManyPauseMock.mockResolvedValue(new Array(150).fill({})); // 150 pauses / 5 collab / 30 jours = 1.0/j

		const resultat = await getCompanyOverview(30);

		expect(resultat).toEqual({
			periode_jours: 30,
			effectif_suffisant: true,
			total_collaborateurs: 5,
			stress_moyen: 5,
			pauses_moyennes_par_jour: 1,
		});
	});

	it("ne compte que les utilisateurs ayant le rôle Collaborateur", async () => {
		countUtilisateurMock.mockResolvedValue(0);
		findManySuiviMock.mockResolvedValue([]);
		findManyPauseMock.mockResolvedValue([]);

		await getCompanyOverview();

		expect(countUtilisateurMock).toHaveBeenCalledWith({
			where: { role: { libelle_role: "Collaborateur" } },
		});
	});
});
