export type Humeur = "stresse" | "fatigue" | "neutre" | "bien" | "zen";

interface HumeurInfo {
	libelle: string;
	niveau: number;
}

export const HUMEURS: Record<Humeur, HumeurInfo> = {
	stresse: { libelle: "Stressé", niveau: 9 },
	fatigue: { libelle: "Fatigué", niveau: 7 },
	neutre: { libelle: "Neutre", niveau: 5 },
	bien: { libelle: "Bien", niveau: 3 },
	zen: { libelle: "Zen", niveau: 1 },
};

export function estHumeurValide(valeur: unknown): valeur is Humeur {
	return typeof valeur === "string" && valeur in HUMEURS;
}

export function libelleDepuisNiveau(niveau: number): string {
	let plusProche: Humeur = "neutre";
	let ecartMin = Infinity;

	for (const cle of Object.keys(HUMEURS) as Humeur[]) {
		const ecart = Math.abs(HUMEURS[cle].niveau - niveau);
		if (ecart < ecartMin) {
			ecartMin = ecart;
			plusProche = cle;
		}
	}

	return HUMEURS[plusProche].libelle;
}
