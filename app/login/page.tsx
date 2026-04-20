"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, Leaf, Lock, Mail } from 'lucide-react';
import { signIn } from "next-auth/react"; // Import important
import { useRouter } from "next/navigation"; // Pour la redirection

interface InputFieldProps {
  label: string;
  type: string;
  icon: React.ElementType;
  placeholder: string;
  name: string;
}

const InputField = ({ label, type, icon: Icon, placeholder, name }: InputFieldProps) => ( // Ajout de name ici
  <div className="flex flex-col space-y-2 w-full">
    <label className="text-sm font-medium text-slate-600 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-700 group-focus-within:text-emerald-500 transition-colors">
        <Icon size={20} />
      </div>
      <input
        name={name} // TRÈS IMPORTANT : Ajout de name ici
        type={type}
        className="block w-full pl-10 pr-3 py-3 bg-white/30 border border-slate-200 rounded-2xl leading-5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition-all backdrop-blur-sm"
        placeholder={placeholder}
        required
      />
    </div>
  </div>
);

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); // Reset de l'erreur

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    // Appel à NextAuth
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // On gère la redirection nous-mêmes
    });

    if (result?.error) {
      setError("Identifiants incorrects. Veuillez réessayer.");
    } else {
      // Succès ! On redirige vers le dashboard (ou la home)
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 border border-white p-10">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mb-4">
            <Leaf size={32} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">ZenTime</h1>
          <p className="text-slate-500 mt-2 font-medium">
            Votre bien-être, notre priorité
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium text-center border border-red-100">
                {error}
                </div>
            )}
          <InputField
            label="Adresse email"
            type="email"
            name="email"
            icon={Mail}
            placeholder="nom.prenom@mail.com"
          />

          <div className="relative">
            <InputField
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              name="password"
              icon={Lock}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-[41px] text-slate-400 hover:text-emerald-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mr-2"
              />
              Se souvenir de moi
            </label>
            <a href="#" className="text-emerald-600 font-semibold hover:underline">
              Mot de passe oublié ?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-1 active:scale-95"
          >
            Se connecter
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-slate-500 text-sm">
            Plateforme conforme au <a href="#" className="underline">RGPD</a>
          </p>
        </div>
      </div>
    </div>
  );
}