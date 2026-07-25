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

	for (const type of typesPause) {
		await prisma.type.upsert({
			where: { libelle_type: type.libelle_type },
			update: {},
			create: type,
		});
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

	const collaborateurs = [
		{ prenom: "Lucas", nom: "Petit", email: "lucas.petit@zentime.fr" },
		{ prenom: "Emma", nom: "Roux", email: "emma.roux@zentime.fr" },
		{ prenom: "Hugo", nom: "Simon", email: "hugo.simon@zentime.fr" },
	];

	for (const c of collaborateurs) {
		await prisma.utilisateur.upsert({
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
	}

	console.log(
		"Comptes créés (mdp: ZenTime2026+) : admin@zentime.fr, manager@zentime.fr, rh@zentime.fr, + 3 collaborateurs",
	);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
