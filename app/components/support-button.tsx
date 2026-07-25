"use client";

import { useState } from "react";
import { Coffee } from "lucide-react";

const MONTANTS = [3, 5, 10];

export default function SupportButton() {
	const [ouvert, setOuvert] = useState(false);
	const [enChargement, setEnChargement] = useState(false);
	const [erreur, setErreur] = useState<string | null>(null);

	async function soutenir(montant: number) {
		setEnChargement(true);
		setErreur(null);
		try {
			const reponse = await fetch("/api/dons", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ montant }),
			});
			if (!reponse.ok) throw new Error();
			const { url } = await reponse.json();
			window.location.href = url;
		} catch {
			setErreur("Impossible de démarrer le paiement");
			setEnChargement(false);
		}
	}

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setOuvert((v) => !v)}
				className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2 rounded-full font-semibold text-sm hover:bg-amber-100 transition-colors"
			>
				<Coffee size={16} /> Soutenir
			</button>

			{ouvert && (
				<div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 z-50">
					<p className="text-xs text-slate-500 mb-3">
						Offrir un café pour soutenir ZenTime :
					</p>
					<div className="flex gap-2">
						{MONTANTS.map((montant) => (
							<button
								key={montant}
								type="button"
								disabled={enChargement}
								onClick={() => soutenir(montant)}
								className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-xl text-sm transition-colors disabled:opacity-50"
							>
								{montant}€
							</button>
						))}
					</div>
					{erreur && <p className="text-red-600 text-xs mt-2">{erreur}</p>}
				</div>
			)}
		</div>
	);
}
