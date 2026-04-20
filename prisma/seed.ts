import { prisma } from "./db.js";
import bcrypt from "bcrypt";

async function main() {
	console.log("Initialisation des données...");

	const adminRole = await prisma.role.upsert({
		where: { libelle_role: "Administrateur" },
		update: {},
		create: { libelle_role: "Administrateur" },
	});

	const hashedPassword = await bcrypt.hash("ZenTime2026+", 10);

	const adminUser = await prisma.utilisateur.upsert({
		where: { mail_utilisateur: "admin@zentime.fr" },
		update: {
			nom_utilisateur: "Beouche",
			prenom_utilisateur: "Zineddine",
		},
		create: {
			nom_utilisateur: "Beouche",
			prenom_utilisateur: "Zineddine",
			mail_utilisateur: "admin@zentime.fr",
			mdp_utilisateur: hashedPassword,
			id_role: adminRole.id_role,
		},
	});

	console.log("Données insérées avec succès ! Utilisateur crée : admin@zentime.fr / ZenTime2026+");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
