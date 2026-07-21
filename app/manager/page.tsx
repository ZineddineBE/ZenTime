// Cible dans le projet : app/manager/page.tsx (nouveau dossier app/manager/)

import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from "@/auth";
import Navbar from "@/app/components/navbar";
import { getTeamOverview, type NiveauRisque } from "@/lib/bien-etre";
import { Users, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

const RISK_STYLES: Record<NiveauRisque, { bg: string; text: string; icon: React.ElementType }> = {
  "Faible": { bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", icon: CheckCircle2 },
  "Modéré": { bg: "bg-orange-50 border-orange-100", text: "text-orange-700", icon: AlertCircle },
  "Élevé": { bg: "bg-red-50 border-red-100", text: "text-red-700", icon: AlertTriangle },
};

export default async function ManagerPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user?.role !== "Manager" && session.user?.role !== "Administrateur") {
    redirect("/dashboard");
  }

  const equipe = await getTeamOverview(Number(session.user.id));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="px-8 pt-16 pb-24 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Users className="text-emerald-600" />
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Vue d'équipe</h1>
        </div>
        <p className="text-slate-500 mb-10 max-w-2xl">
          Un indicateur de bien-être par collaborateur, sans intrusion dans la vie privée :
          les niveaux de stress et l'historique des pauses restent confidentiels, seul un
          niveau de risque global est partagé avec vous.
        </p>

        {equipe.length === 0 ? (
          <p className="text-slate-400 italic">Aucun collaborateur rattaché pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {equipe.map((membre) => {
              const style = RISK_STYLES[membre.niveau_risque];
              const Icon = style.icon;
              return (
                <div
                  key={membre.id}
                  className={`p-5 rounded-2xl border ${style.bg} flex items-center justify-between`}
                >
                  <span className="font-semibold text-slate-800">{membre.prenom}</span>
                  <span className={`flex items-center gap-2 font-bold text-sm ${style.text}`}>
                    <Icon size={18} />
                    {membre.niveau_risque}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}