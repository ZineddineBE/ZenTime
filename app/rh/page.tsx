import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from "@/auth";
import Navbar from "@/app/components/navbar";
import { getCompanyOverview } from "@/lib/bien-etre";
import { Building2, Info } from 'lucide-react';

export default async function RhPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user?.role !== "Responsable RH" && session.user?.role !== "Administrateur") {
    redirect("/dashboard");
  }

  const stats = await getCompanyOverview();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="px-8 pt-16 pb-24 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="text-emerald-600" />
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Vue d'ensemble RH
          </h1>
        </div>
        <p className="text-slate-500 mb-10 max-w-2xl">
          Statistiques agrégées sur les {stats.periode_jours} derniers jours — aucune donnée
          nominative n'est accessible depuis cet espace.
        </p>

        {!stats.effectif_suffisant ? (
          <div className="flex items-start gap-3 bg-slate-100 border border-slate-200 p-6 rounded-2xl text-slate-600 max-w-xl">
            <Info size={20} className="mt-0.5 flex-shrink-0" />
            <p>
              Effectif encore trop restreint pour publier des statistiques anonymisées de
              façon fiable (seuil minimum : 5 collaborateurs).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-slate-500 text-sm font-medium">Collaborateurs suivis</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {stats.total_collaborateurs}
              </h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-slate-500 text-sm font-medium">Stress moyen (1-10)</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {stats.stress_moyen?.toFixed(1) ?? "N/A"}
              </h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-slate-500 text-sm font-medium">Pauses / jour / personne</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {stats.pauses_moyennes_par_jour ?? "N/A"}
              </h3>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}