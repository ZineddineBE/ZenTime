"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldOff } from "lucide-react";

interface RgpdPanelProps {
	aConsentiInitialement: boolean;
}

export default function RgpdPanel({ aConsentiInitialement }: RgpdPanelProps) {
	const router = useRouter();
	const [aConsenti, setAConsenti] = useState(aConsentiInitialement);
	const [caseCochee, setCaseCochee] = useState(false);
	const [enChargement, setEnChargement] = useState(false);
	const [erreur, setErreur] = useState<string | null>(null);

	async function donnerConsentement() {
		setEnChargement(true);
		setErreur(null);
		try {
			const reponse = await fetch("/api/rgpd/consentement", { method: "POST" });
			if (!reponse.ok) throw new Error();
			setAConsenti(true);
			router.refresh();
		} catch {
			setErreur("Impossible d'enregistrer votre consentement, réessayez.");
		} finally {
			setEnChargement(false);
		}
	}

	async function revoquerConsentement() {
		setEnChargement(true);
		setErreur(null);
		try {
			const reponse = await fetch("/api/rgpd/revoquer", { method: "POST" });
			if (!reponse.ok) throw new Error();
			setAConsenti(false);
			setCaseCochee(false);
			router.refresh();
		} catch {
			setErreur("Impossible de révoquer votre consentement, réessayez.");
		} finally {
			setEnChargement(false);
		}
	}

	if (aConsenti) {
		return (
			<div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
				<div className="flex items-center gap-3 mb-4">
					<div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
						<ShieldCheck size={22} />
					</div>
					<div>
						<h2 className="text-xl font-bold text-slate-800">Consentement donné</h2>
						<p className="text-slate-500 text-sm">
							Vos pauses et votre suivi de stress sont enregistrés.
						</p>
					</div>
				</div>

				<div className="border-t border-slate-100 pt-5 mt-5">
					<h3 className="font-bold text-slate-800 mb-1">Droit à l&apos;oubli</h3>
					<p className="text-slate-500 text-sm mb-4">
						Vous pouvez à tout moment révoquer votre consentement. Votre historique
						personnel (pauses, suivis de stress) sera alors supprimé
						définitivement. Votre compte reste actif (identifiant, rôle),
						géré par les administrateurs.
					</p>
					<button
						type="button"
						disabled={enChargement}
						onClick={revoquerConsentement}
						className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
					>
						<ShieldOff size={16} />
						{enChargement ? "..." : "Révoquer mon consentement et supprimer mon historique"}
					</button>
					{erreur && <p className="text-red-600 text-xs mt-2">{erreur}</p>}
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
			<div className="flex items-center gap-3 mb-4">
				<div className="w-12 h-12 rounded-2xl bg-slate-300 flex items-center justify-center text-white flex-shrink-0">
					<ShieldOff size={22} />
				</div>
				<div>
					<h2 className="text-xl font-bold text-slate-800">Consentement non donné</h2>
					<p className="text-slate-500 text-sm">
						Sans consentement, vos pauses et votre stress ne peuvent pas être
						enregistrés.
					</p>
				</div>
			</div>

			<label className="flex items-start gap-3 mt-5 cursor-pointer">
				<input
					type="checkbox"
					checked={caseCochee}
					onChange={(e) => setCaseCochee(e.target.checked)}
					className="mt-1 w-4 h-4 accent-emerald-600"
				/>
				<span className="text-sm text-slate-600">
					J&apos;accepte que ZenTime collecte mes pauses et mon niveau de stress
					auto-déclaré, dans le seul but de m&apos;accompagner et d&apos;alimenter
					des statistiques anonymisées destinées à mon manager et au service RH.
				</span>
			</label>

			<button
				type="button"
				disabled={!caseCochee || enChargement}
				onClick={donnerConsentement}
				className="mt-5 bg-emerald-600 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
			>
				{enChargement ? "..." : "Valider mon consentement"}
			</button>
			{erreur && <p className="text-red-600 text-xs mt-2">{erreur}</p>}
		</div>
	);
}
