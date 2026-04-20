import { PrismaClient } from "./client/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
const adapter = new PrismaMariaDb({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "root",
	database: "zentime_db",
});
export const prisma = new PrismaClient({ adapter });

async function main() {
	console.log("Initialisation des données (roles et pauses)");

	const roles = [
		{ id_role: 1, libelle_role: "RH" },
		{ id_role: 2, libelle_role: "Manager" },
		{ id_role: 3, libelle_role: "Collaborateur" },
	];

	for (const role of roles) {
		await prisma.role.upsert({
			where: { id_role: role.id_role },
			update: {},
			create: role,
		});
	}

	const types = [
		{
			id_type: 1,
			libelle_type: "Pause Café",
			description_type: "Moment de détente sociale",
			duree_type: 5,
		},
		{
			id_type: 2,
			libelle_type: "Étirements",
			description_type: "Série de mouvements pour le dos",
			duree_type: 10,
		},
		{
			id_type: 3,
			libelle_type: "Méditation",
			description_type: "Exercice de respiration guidée",
			duree_type: 15,
		},
	];

	for (const t of types) {
		await prisma.type.upsert({
			where: { id_type: t.id_type },
			update: {},
			create: t,
		});
	}

	console.log("Données insérées avec succès !");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
