import React from 'react';
import Link from 'next/link';
import { auth, signOut } from "@/auth"; // Import de NextAuth
import {
  Leaf,
  Coffee,
  Activity,
  Brain,
  ChevronRight,
  BarChart3,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

// Typage pour TypeScript
interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const FeatureCard = ({ icon: Icon, title, description, color }: FeatureCardProps) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div
      className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white mb-6`}
    >
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{description}</p>
  </div>
);

export default async function HomePage() {
  // Récupération de la session côté serveur
  const session = await auth();
  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2 text-emerald-600">
          <Leaf size={28} fill="currentColor" />
          <span className="text-2xl font-bold text-slate-800">ZenTime</span>
        </div>
        
        <div className="flex items-center space-x-6">
          {isLoggedIn ? (
            // Affichage si l'utilisateur est connecté
            <>
              <span className="text-slate-600 font-medium hidden sm:block">
                {session.user?.name}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-slate-100 text-slate-700 px-5 py-2.5 rounded-full font-semibold hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Déconnexion</span>
                </button>
              </form>
            </>
          ) : (
            // Affichage si l'utilisateur est visiteur
            <Link 
              href="/login"
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Connexion
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 pt-16 pb-24 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
          {isLoggedIn ? (
            <>
              Bonjour <span className="text-emerald-600">{session.user?.name?.split(' ')[0]}</span>, <br />
              prêt pour votre journée ?
            </>
          ) : (
            <>
              Cultivez votre <span className="text-emerald-600">bien-être</span> <br /> au travail.
            </>
          )}
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Un système complet pour suivre vos pauses, encourager l'activité
          physique et apaiser votre esprit au quotidien.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href={isLoggedIn ? "/dashboard" : "/login"} 
            className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 flex items-center justify-center transition-transform hover:-translate-y-1"
          >
            {isLoggedIn ? "Accéder à mon espace" : "Commencer maintenant"} <ChevronRight className="ml-2" />
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-slate-50 py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Une solution complète
            </h2>
            <p className="text-slate-500">
              Conçue pour prévenir la fatigue mentale et physique.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Coffee}
              title="Pauses Intelligentes"
              description="Alertes personnalisées pour éviter de rester assis trop longtemps et réduire la fatigue."
              color="bg-orange-400"
            />
            <FeatureCard
              icon={Activity}
              title="Activité Adaptée"
              description="Des exercices simples d'étirement conçus pour votre poste de travail."
              color="bg-emerald-500"
            />
            <FeatureCard
              icon={Brain}
              title="Santé Mentale"
              description="Méditation et respiration guidée pour réduire le stress prolongé."
              color="bg-sky-500"
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-8 max-w-7xl mx-auto border-t border-slate-100">
        <div className="flex flex-col md:flex-row items-center justify-around gap-12 opacity-60">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="text-slate-400" />
            <span className="font-semibold text-slate-500 uppercase tracking-widest text-sm">
              Conforme RGPD
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="text-slate-400" />
            <span className="font-semibold text-slate-500 uppercase tracking-widest text-sm">
              Suivi Statistique
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}