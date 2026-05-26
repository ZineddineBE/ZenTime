import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from "@/auth";
import Navbar from "@/app/components/navbar";
import {
  Activity,
  Wind,
  Coffee,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

// Typage TypeScript des cartes de statistiques
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  isAI?: boolean;
}

const StatCard = ({ title, value, icon: Icon, color, isAI }: StatCardProps) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center space-x-4 relative overflow-hidden">
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white flex-shrink-0`}>
      <Icon size={22} />
    </div>
    <div className="flex-1">
      <div className="flex items-center space-x-2">
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        {isAI && (
          <span className="flex items-center text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-tighter">
            <Sparkles size={10} className="mr-1" /> AI
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{value}</h3>
    </div>
  </div>
);

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Extraction dynamique du prénom de l'utilisateur connecté
  const firstName = session.user?.name?.split(' ')[0] || "Utilisateur";

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
          <div>
            <div className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-100 px-5 py-2.5 rounded-full text-sm font-bold tracking-wide shadow-sm">
              Statut : Zen
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard
            title="Temps de pause"
            value="45 min"
            icon={Coffee}
            color="bg-orange-400"
          />
          <StatCard
            title="Activité physique"
            value="3 200 pas"
            icon={Activity}
            color="bg-emerald-500"
          />
          <StatCard
            title="Niveau de Stress"
            value="Faible"
            icon={Wind}
            color="bg-sky-500"
            isAI={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <TrendingUp className="mr-2 text-emerald-500" /> Suggestions du jour
            </h2>
            <div className="space-y-4">
              <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center justify-between group hover:shadow-md transition-all">
                <div>
                  <p className="font-bold text-emerald-900">Étirement des cervicales</p>
                  <p className="text-sm text-emerald-700 mt-0.5">Idéal après 2h passées sur écran</p>
                </div>
                <button className="bg-white text-emerald-600 border border-emerald-200 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-600 hover:text-white transition-colors">
                  Lancer
                </button>
              </div>
              
              <div className="p-5 bg-sky-50/50 rounded-2xl border border-sky-100 flex items-center justify-between group hover:shadow-md transition-all">
                <div>
                  <p className="font-bold text-sky-900">Respiration guidée (4-7-8)</p>
                  <p className="text-sm text-sky-700 mt-0.5">Technique éprouvée de relaxation express</p>
                </div>
                <button className="bg-white text-sky-600 border border-sky-200 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-sky-600 hover:text-white transition-colors">
                  Lancer
                </button>
              </div>
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