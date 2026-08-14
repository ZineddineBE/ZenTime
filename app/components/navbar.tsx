import Link from 'next/link';
import { auth, signOut } from "@/auth";
import { Leaf, LogOut, Users, Building2, Code2, ShieldCheck } from 'lucide-react';
import SupportButton from "@/app/components/support-button";

export default async function Navbar() {
  const session = await auth();
  const isLoggedIn = !!session;
  const role = session?.user?.role;

  return (
    <nav className="bg-white border-b border-slate-100 shadow-sm">
      <div className="flex justify-between items-center px-8 py-5 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center space-x-2 text-emerald-600 hover:opacity-90 transition-opacity">
          <Leaf size={28} fill="currentColor" />
          <span className="text-2xl font-bold text-slate-800">ZenTime</span>
        </Link>

        <div className="flex items-center space-x-6">
          <Link
            href="/api-docs.html"
            className="hidden sm:flex items-center gap-1.5 text-slate-400 hover:text-emerald-600 font-semibold text-sm transition-colors"
          >
            <Code2 size={16} /> API
          </Link>
          {isLoggedIn ? (
            <>
              {(role === "Manager" || role === "Administrateur") && (
                <Link
                  href="/manager"
                  className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 font-semibold text-sm transition-colors"
                >
                  <Users size={16} /> Équipe
                </Link>
              )}
              {(role === "Responsable RH" || role === "Administrateur") && (
                <Link
                  href="/rh"
                  className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 font-semibold text-sm transition-colors"
                >
                  <Building2 size={16} /> RH
                </Link>
              )}
              <Link
                href="/confidentialite"
                className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 font-semibold text-sm transition-colors"
              >
                <ShieldCheck size={16} /> Confidentialité
              </Link>
              <span className="text-slate-600 font-medium hidden sm:block">
                {session.user?.name}
              </span>
              <SupportButton />
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
            <Link 
              href="/login"
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}