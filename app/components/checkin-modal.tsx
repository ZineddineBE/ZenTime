"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CloudLightning, Frown, Meh, Smile, Sun, X } from "lucide-react";
import { HUMEURS, type Humeur } from "@/lib/stress";

const ICONES: Record<Humeur, React.ElementType> = {
	stresse: CloudLightning,
	fatigue: Frown,
	neutre: Meh,
	bien: Smile,
	zen: Sun,
};

const ORDRE: Humeur[] = ["stresse", "fatigue", "neutre", "bien", "zen"];

export default function CheckInModal() {
	const router = useRouter();
	const [ouvert, setOuvert] = useState(false);
	const [selection, setSelection] = useState<Humeur | null>(null);
	const [enChargement, setEnChargement] = useState(false);
	const [erreur, setErreur] = useState<string | null>(null);

	function fermer() {
		setOuvert(false);
		setSelection(null);
		setErreur(null);
	}

	async function valider() {
		if (!selection) return;
		setEnChargement(true);
		setErreur(null);
		try {
			const reponse = await fetch("/api/suivi-stress", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ humeur: selection }),
			});
			if (!reponse.ok) throw new Error();
			fermer();
			router.refresh();
		} catch {
			setErreur("Impossible d'enregistrer votre état, réessayez.");
		} finally {
			setEnChargement(false);
		}
	}

	return (
		<>
			<button
				type="button"
				onClick={() => setOuvert(true)}
				className="bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-full font-semibold text-sm shadow-sm hover:border-emerald-300 hover:text-emerald-600 transition-colors"
			>
				Comment vous sentez-vous ?
			</button>

			{ouvert && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6">
					<div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl p-8 relative">
						<button
							type="button"
							onClick={fermer}
							className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
							aria-label="Fermer"
						>
							<X size={22} />
						</button>

						<h2 className="text-2xl font-extrabold text-slate-900 text-center mb-2">
							Comment vous sentez-vous ?
						</h2>
						<p className="text-slate-500 text-center mb-8">
							Cela nous aide à ajuster vos recommandations.
						</p>

						<div className="flex justify-between gap-2 mb-8">
							{ORDRE.map((humeur) => {
								const Icone = ICONES[humeur];
								const estSelectionne = selection === humeur;
								return (
									<button
										key={humeur}
										type="button"
										onClick={() => setSelection(humeur)}
										className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-colors ${
											estSelectionne
												? "border-emerald-500 text-emerald-600"
												: "border-transparent text-slate-300 hover:text-slate-400"
										}`}
									>
										<Icone size={28} />
										<span className="text-[11px] font-bold uppercase tracking-tight">
											{HUMEURS[humeur].libelle}
										</span>
									</button>
								);
							})}
						</div>

						{erreur && (
							<p className="text-red-600 text-sm text-center mb-4">{erreur}</p>
						)}

						<button
							type="button"
							disabled={!selection || enChargement}
							onClick={valider}
							className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{enChargement ? "Enregistrement..." : "Valider mon état"}
						</button>
					</div>
				</div>
			)}
		</>
	);
}
