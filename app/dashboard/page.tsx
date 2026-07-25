import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from "@/auth";
import { prisma } from "@/prisma/db";
import { HUMEURS, type Humeur } from "@/lib/stress";
import Navbar from "@/app/components/navbar";
import PauseCard from "@/app/components/pause-card";
import CheckInModal from "@/app/components/checkin-modal";
import WeatherWidget from "@/app/components/weather-widget";
import {
  Coffee,
  ListChecks,
  Wind,
  TrendingUp,
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center space-x-4 relative overflow-hidden">
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white flex-shrink-0`}>
      <Icon size={22} />
    </div>
    <div className="flex-1">
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{value}</h3>
    </div>
  </div>
);

function dureeEnMinutes(debut: Date, fin: Date): number {
  return Math.round((fin.getTime() - debut.getTime()) / 60000);
}

function libelleHumeurPlusProche(niveau: number): string {
  let plusProche: Humeur = "neutre";
  let ecartMin = Infinity;

  for (const cle of Object.keys(HUMEURS) as Humeur[]) {
    const ecart = Math.abs(HUMEURS[cle].niveau - niveau);
    if (ecart < ecartMin) {
      ecartMin = ecart;
      plusProche = cle;
    }
  }

  return HUMEURS[plusProche].libelle;
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const firstName = session.user?.name?.split(' ')[0] || "Utilisateur";
  const idUtilisateur = Number(session.user?.id);

  const debutJournee = new Date();
  debutJournee.setHours(0, 0, 0, 0);

  const [pausesAujourdhui, dernierSuivi, typeEtirement, typeRespiration] = await Promise.all([
    prisma.pause.findMany({
      where: {
        id_utilisateur: idUtilisateur,
        heure_debut_pause: { gte: debutJournee },
      },
    }),
    prisma.suiviStress.findFirst({
      where: { id_utilisateur: idUtilisateur },
      orderBy: { date_suivi_stress: "desc" },
    }),
    prisma.type.findUnique({ where: { libelle_type: "Étirement" } }),
    prisma.type.findUnique({ where: { libelle_type: "Respiration guidée" } }),
  ]);

  const tempsPauseMinutes = pausesAujourdhui
    .filter((p) => p.heure_debut_pause && p.heure_fin_pause)
    .reduce(
      (total, p) => total + dureeEnMinutes(p.heure_debut_pause!, p.heure_fin_pause!),
      0,
    );

  const pauseEtirementEnCours = pausesAujourdhui.find(
    (p) => p.id_type === typeEtirement?.id_type && !p.heure_fin_pause,
  );
  const pauseRespirationEnCours = pausesAujourdhui.find(
    (p) => p.id_type === typeRespiration?.id_type && !p.heure_fin_pause,
  );

  const statutActuel = dernierSuivi
    ? libelleHumeurPlusProche(dernierSuivi.niveau_suivi_stress)
    : "Zen";

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="px-8 pt-16 pb-24 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Bonjour <span className="text-emerald-600">{firstName}</span> 👋
            </h1>
            <p className="text-slate-500 mt-1">Prêt pour une journée de travail sereine ?</p>
          </div>
          <div className="flex items-center gap-3">
            <WeatherWidget />
            <div className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-100 px-5 py-2.5 rounded-full text-sm font-bold tracking-wide shadow-sm">
              Statut : {statutActuel}
            </div>
            <CheckInModal />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard
            title="Temps de pause (aujourd'hui)"
            value={`${tempsPauseMinutes} min`}
            icon={Coffee}
            color="bg-orange-400"
          />
          <StatCard
            title="Pauses aujourd'hui"
            value={`${pausesAujourdhui.length}`}
            icon={ListChecks}
            color="bg-emerald-500"
          />
          <StatCard
            title="Dernière humeur renseignée"
            value={statutActuel}
            icon={Wind}
            color="bg-sky-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <TrendingUp className="mr-2 text-emerald-500" /> Suggestions du jour
            </h2>
            <div className="space-y-4">
              {typeEtirement ? (
                <PauseCard
                  idType={typeEtirement.id_type}
                  titre="Étirement des cervicales"
                  description="Idéal après 2h passées sur écran"
                  couleur="emerald"
                  pauseEnCoursId={pauseEtirementEnCours?.id_pause ?? null}
                />
              ) : null}

              {typeRespiration ? (
                <PauseCard
                  idType={typeRespiration.id_type}
                  titre="Respiration guidée (4-7-8)"
                  description="Technique éprouvée de relaxation express"
                  couleur="sky"
                  pauseEnCoursId={pauseRespirationEnCours?.id_pause ?? null}
                />
              ) : null}
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold mb-6">Objectif Hebdomadaire</h2>
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-sm">Indice de bien-être global</span>
                <span className="text-emerald-400 font-bold">85%</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[85%] rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]"></div>
              </div>
            </div>
            <p className="mt-8 text-slate-300 text-sm italic border-l-2 border-emerald-500 pl-4 py-1">
              "Continuez ainsi ! Vos indicateurs montrent une augmentation de 15% de vos temps de pause salvateurs cette semaine."
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
