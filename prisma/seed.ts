import { prisma } from "./db.js";
import bcrypt from "bcrypt";

async function main() {
	console.log("Initialisation des données...");

	const adminRole = await prisma.role.upsert({
		where: { libelle_role: "Administrateur" },
		update: {},
		create: { libelle_role: "Administrateur" },
	});

	const collaborateurRole = await prisma.role.upsert({
		where: { libelle_role: "Collaborateur" },
		update: {},
		create: { libelle_role: "Collaborateur" },
	});

	const managerRole = await prisma.role.upsert({
		where: { libelle_role: "Manager" },
		update: {},
		create: { libelle_role: "Manager" },
	});

	const rhRole = await prisma.role.upsert({
		where: { libelle_role: "Responsable RH" },
		update: {},
		create: { libelle_role: "Responsable RH" },
	});

	const typesPause = [
		{
			libelle_type: "Étirement",
			description_type: "Étirements courts adaptés au poste de travail (cervicales, dos, poignets).",
			duree_type: 5,
		},
		{
			libelle_type: "Respiration guidée",
			description_type: "Technique de respiration 4-7-8 pour réduire le stress rapidement.",
			duree_type: 5,
		},
		{
			libelle_type: "Marche courte",
			description_type: "Marche brève pour rompre la sédentarité.",
			duree_type: 10,
		},
		{
			libelle_type: "Pause libre",
			description_type: "Pause non guidée, à l'initiative du collaborateur.",
			duree_type: 15,
		},
	];

	const typesCrees = [];
	for (const type of typesPause) {
		typesCrees.push(
			await prisma.type.upsert({
				where: { libelle_type: type.libelle_type },
				update: {},
				create: type,
			}),
		);
	}

	const hashedPassword = await bcrypt.hash("ZenTime2026+", 10);

	await prisma.utilisateur.upsert({
		where: { mail_utilisateur: "admin@zentime.fr" },
		update: {},
		create: {
			nom_utilisateur: "Beouche",
			prenom_utilisateur: "Zineddine",
			mail_utilisateur: "admin@zentime.fr",
			mdp_utilisateur: hashedPassword,
			consentement_rgpd_utilisateur: true,
			id_role: adminRole.id_role,
		},
	});

	const managerUser = await prisma.utilisateur.upsert({
		where: { mail_utilisateur: "manager@zentime.fr" },
		update: {},
		create: {
			nom_utilisateur: "Martin",
			prenom_utilisateur: "Claire",
			mail_utilisateur: "manager@zentime.fr",
			mdp_utilisateur: hashedPassword,
			consentement_rgpd_utilisateur: true,
			id_role: managerRole.id_role,
		},
	});

	await prisma.utilisateur.upsert({
		where: { mail_utilisateur: "rh@zentime.fr" },
		update: {},
		create: {
			nom_utilisateur: "Dubois",
			prenom_utilisateur: "Sophie",
			mail_utilisateur: "rh@zentime.fr",
			mdp_utilisateur: hashedPassword,
			consentement_rgpd_utilisateur: true,
			id_role: rhRole.id_role,
		},
	});

	// 9 collaborateurs, avec un historique de stress/pauses volontairement
	// varié (3 profils "Faible", 3 "Modéré", 3 "Élevé" au sens de
	// classifierRisque() dans lib/bien-etre.ts), pour que les dashboards
	// Manager/RH aient de quoi montrer autre chose que des cases vides.
	const collaborateurs = [
		// --- Profil Faible : stress bas + pauses régulières (≥3/jour) ---
		{ prenom: "Lucas", nom: "Petit", email: "lucas.petit@zentime.fr", suivis: [2, 3, 2], pausesSemaine: 22 },
		{ prenom: "Léa", nom: "Bernard", email: "lea.bernard@zentime.fr", suivis: [1, 2], pausesSemaine: 21 },
		{ prenom: "Camille", nom: "Faure", email: "camille.faure@zentime.fr", suivis: [3, 3, 2], pausesSemaine: 25 },
		// --- Profil Modéré : soit stress moyen (4-6), soit pauses insuffisantes (1.5-3/jour) ---
		{ prenom: "Emma", nom: "Roux", email: "emma.roux@zentime.fr", suivis: [5, 6, 4], pausesSemaine: 20 },
		{ prenom: "Thomas", nom: "Girard", email: "thomas.girard@zentime.fr", suivis: [2, 3], pausesSemaine: 14 },
		{ prenom: "Nicolas", nom: "Morel", email: "nicolas.morel@zentime.fr", suivis: [6, 5], pausesSemaine: 18 },
		// --- Profil Élevé : soit stress fort (≥7), soit très peu de pauses (<1.5/jour) ---
		{ prenom: "Hugo", nom: "Simon", email: "hugo.simon@zentime.fr", suivis: [8, 9, 7], pausesSemaine: 5 },
		{ prenom: "Chloé", nom: "Fontaine", email: "chloe.fontaine@zentime.fr", suivis: [3, 2], pausesSemaine: 8 },
		{ prenom: "Julien", nom: "Robert", email: "julien.robert@zentime.fr", suivis: [9], pausesSemaine: 3 },
	];

	const maintenant = new Date();

	for (const c of collaborateurs) {
		const utilisateur = await prisma.utilisateur.upsert({
			where: { mail_utilisateur: c.email },
			update: {},
			create: {
				nom_utilisateur: c.nom,
				prenom_utilisateur: c.prenom,
				mail_utilisateur: c.email,
				mdp_utilisateur: hashedPassword,
				consentement_rgpd_utilisateur: true,
				id_role: collaborateurRole.id_role,
				id_utilisateur_1: managerUser.id_utilisateur,
			},
		});

		// Suivis de stress répartis sur les 7 derniers jours.
		for (let i = 0; i < c.suivis.length; i++) {
			const date = new Date(maintenant);
			date.setDate(date.getDate() - i * 2);
			await prisma.suiviStress.create({
				data: {
					id_utilisateur: utilisateur.id_utilisateur,
					niveau_suivi_stress: c.suivis[i],
					date_suivi_stress: date,
				},
			});
		}

		// Pauses (terminées) réparties sur les 7 derniers jours, types variés.
		for (let i = 0; i < c.pausesSemaine; i++) {
			const debut = new Date(maintenant);
			debut.setDate(debut.getDate() - (i % 7));
			debut.setHours(9 + (i % 8), (i * 7) % 60, 0, 0);
			const fin = new Date(debut);
			fin.setMinutes(fin.getMinutes() + 10);

			await prisma.pause.create({
				data: {
					id_utilisateur: utilisateur.id_utilisateur,
					id_type: typesCrees[i % typesCrees.length].id_type,
					heure_debut_pause: debut,
					heure_fin_pause: fin,
				},
			});
		}
	}

	console.log(
		"Comptes créés (mdp: ZenTime2026+) : admin@zentime.fr, manager@zentime.fr, rh@zentime.fr, + 9 collaborateurs avec historique varié",
	);
}

try {
	await main();
} catch (e) {
	console.error(e);
	process.exit(1);
} finally {
	await prisma.$disconnect();
}
