import { prisma } from "@/prisma/db";

export type NiveauRisque = "Faible" | "Modéré" | "Élevé";

const SEUIL_STRESS_ELEVE = 7; // niveau_suivi_stress noté de 1 à 10
const SEUIL_STRESS_MODERE = 4;
const PAUSES_MIN_RECOMMANDEES_PAR_JOUR = 3;
const EFFECTIF_MIN_POUR_STATS_RH = 5;

function classifierRisque(
	stressMoyen: number | null,
	pausesParJour: number,
): NiveauRisque {
	if (stressMoyen !== null && stressMoyen >= SEUIL_STRESS_ELEVE)
		return "Élevé";
	if (pausesParJour < PAUSES_MIN_RECOMMANDEES_PAR_JOUR / 2) return "Élevé";
	if (
		(stressMoyen !== null && stressMoyen >= SEUIL_STRESS_MODERE) ||
		pausesParJour < PAUSES_MIN_RECOMMANDEES_PAR_JOUR
	) {
		return "Modéré";
	}
	return "Faible";
}

/** Vue MANAGER : équipe directe uniquement (relation hiérarchique existante), réduite à un indicateur qualitatif par personne. */
export async function getTeamOverview(managerId: number, joursHistorique = 7) {
	const depuis = new Date();
	depuis.setDate(depuis.getDate() - joursHistorique);

	const equipe = await prisma.utilisateur.findMany({
		where: { id_utilisateur_1: managerId },
		select: {
			id_utilisateur: true,
			prenom_utilisateur: true,
			suivis_stress: { where: { date_suivi_stress: { gte: depuis } } },
			pauses: { where: { heure_debut_pause: { gte: depuis } } },
		},
	});

	return equipe.map((membre) => {
		const stressMoyen = membre.suivis_stress.length
			? membre.suivis_stress.reduce(
					(s, v) => s + v.niveau_suivi_stress,
					0,
				) / membre.suivis_stress.length
			: null;
		const pausesParJour = membre.pauses.length / joursHistorique;

		return {
			id: membre.id_utilisateur,
			prenom: membre.prenom_utilisateur, // le nom de famille n'est volontairement pas exposé
			niveau_risque: classifierRisque(stressMoyen, pausesParJour),
		};
	});
}

/** Vue RH : agrégats globaux uniquement, aucune donnée individuelle ni nominative. */
export async function getCompanyOverview(joursHistorique = 30) {
	const depuis = new Date();
	depuis.setDate(depuis.getDate() - joursHistorique);

	const [suivis, pauses, totalCollaborateurs] = await Promise.all([
		prisma.suiviStress.findMany({
			where: { date_suivi_stress: { gte: depuis } },
		}),
		prisma.pause.findMany({
			where: { heure_debut_pause: { gte: depuis } },
		}),
		prisma.utilisateur.count({
			where: { role: { libelle_role: "Collaborateur" } },
		}),
	]);

	const effectifSuffisant = totalCollaborateurs >= EFFECTIF_MIN_POUR_STATS_RH;

	const stressMoyenGlobal = suivis.length
		? suivis.reduce((s, v) => s + v.niveau_suivi_stress, 0) / suivis.length
		: null;

	const pausesParCollaborateurEtParJour =
		totalCollaborateurs > 0
			? pauses.length / totalCollaborateurs / joursHistorique
			: 0;

	return {
		periode_jours: joursHistorique,
		effectif_suffisant: effectifSuffisant,
		total_collaborateurs: effectifSuffisant ? totalCollaborateurs : null,
		stress_moyen: effectifSuffisant ? stressMoyenGlobal : null,
		pauses_moyennes_par_jour: effectifSuffisant
			? Number(pausesParCollaborateurEtParJour.toFixed(1))
			: null,
	};
}
