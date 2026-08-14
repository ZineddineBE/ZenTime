import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/prisma/db";
import Navbar from "@/app/components/navbar";
import RgpdPanel from "@/app/components/rgpd-panel";

export default async function ConfidentialitePage() {
	const session = await auth();
	if (!session?.user?.id) {
		redirect("/login");
	}

	const utilisateur = await prisma.utilisateur.findUnique({
		where: { id_utilisateur: Number(session.user.id) },
		select: { consentement_rgpd_utilisateur: true },
	});

	return (
		<div className="min-h-screen bg-slate-50">
			<Navbar />

			<main className="px-8 pt-16 pb-24 max-w-3xl mx-auto">
				<h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
					Confidentialité &amp; RGPD
				</h1>
				<p className="text-slate-500 mb-10">
					Gérez le consentement de collecte de vos données de bien-être.
				</p>

				<RgpdPanel aConsentiInitialement={utilisateur?.consentement_rgpd_utilisateur ?? false} />
			</main>
		</div>
	);
}
