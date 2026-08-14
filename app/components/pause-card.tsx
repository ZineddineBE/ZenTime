"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Couleur = "emerald" | "sky";

const STYLES: Record<
	Couleur,
	{ container: string; titre: string; sousTitre: string; bouton: string; boutonActif: string }
> = {
	emerald: {
		container: "bg-emerald-50/50 border-emerald-100",
		titre: "text-emerald-900",
		sousTitre: "text-emerald-700",
		bouton: "text-emerald-600 border-emerald-200 hover:bg-emerald-600 hover:text-white",
		boutonActif: "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700",
	},
	sky: {
		container: "bg-sky-50/50 border-sky-100",
		titre: "text-sky-900",
		sousTitre: "text-sky-700",
		bouton: "text-sky-600 border-sky-200 hover:bg-sky-600 hover:text-white",
		boutonActif: "bg-sky-600 text-white border-sky-600 hover:bg-sky-700",
	},
};

interface PauseCardProps {
	idType: number;
	titre: string;
	description: string;
	couleur: Couleur;
	pauseEnCoursId?: number | null;
}

export default function PauseCard({
	idType,
	titre,
	description,
	couleur,
	pauseEnCoursId = null,
}: PauseCardProps) {
	const router = useRouter();
	const [pauseId, setPauseId] = useState<number | null>(pauseEnCoursId);
	const [enChargement, setEnChargement] = useState(false);
	const [erreur, setErreur] = useState<string | null>(null);
	const style = STYLES[couleur];

	async function lancerPause() {
		setEnChargement(true);
		setErreur(null);
		try {
			const reponse = await fetch("/api/pauses", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id_type: idType }),
			});
			const donnees = await reponse.json().catch(() => null);
			if (!reponse.ok) {
				setErreur(donnees?.error ?? "Impossible de démarrer la pause");
				return;
			}
			setPauseId(donnees.id_pause);
			router.refresh();
		} catch {
			setErreur("Impossible de démarrer la pause");
		} finally {
			setEnChargement(false);
		}
	}

	async function terminerPause() {
		if (!pauseId) return;
		setEnChargement(true);
		setErreur(null);
		try {
			const reponse = await fetch(`/api/pauses/${pauseId}`, { method: "PATCH" });
			if (!reponse.ok) throw new Error();
			setPauseId(null);
			router.refresh();
		} catch {
			setErreur("Impossible de terminer la pause");
		} finally {
			setEnChargement(false);
		}
	}

	const enCours = pauseId !== null;

	return (
		<div
			className={`p-5 rounded-2xl border flex items-center justify-between group hover:shadow-md transition-all ${style.container}`}
		>
			<div>
				<p className={`font-bold ${style.titre}`}>{titre}</p>
				<p className={`text-sm mt-0.5 ${style.sousTitre}`}>
					{erreur ?? description}
				</p>
			</div>
			<button
				type="button"
				disabled={enChargement}
				onClick={enCours ? terminerPause : lancerPause}
				className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm border transition-colors disabled:opacity-50 ${
					enCours ? style.boutonActif : `bg-white ${style.bouton}`
				}`}
			>
				{enChargement ? "..." : enCours ? "Terminer" : "Lancer"}
			</button>
		</div>
	);
}
