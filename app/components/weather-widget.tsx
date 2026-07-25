"use client";

import { useEffect, useState } from "react";
import { Sun, Cloud, CloudRain, CloudSnow, CloudFog, CloudLightning } from "lucide-react";

// Coordonnées de Metz (siège de Metz Numeric School)
const LATITUDE = 49.1193;
const LONGITUDE = 6.1757;

const API_METEO_URL =
	`https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}` +
	"&current=temperature_2m,weather_code&timezone=Europe%2FParis";

interface Meteo {
	temperature: number;
	codeTemps: number;
}

/** Mapping simplifié des codes météo WMO (norme utilisée par Open-Meteo). */
function iconePourCode(code: number): React.ElementType {
	if (code === 0) return Sun;
	if ([45, 48].includes(code)) return CloudFog;
	if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return CloudRain;
	if ([71, 73, 75, 77, 85, 86].includes(code)) return CloudSnow;
	if ([95, 96, 99].includes(code)) return CloudLightning;
	return Cloud;
}

export default function WeatherWidget() {
	const [meteo, setMeteo] = useState<Meteo | null>(null);
	const [erreur, setErreur] = useState(false);

	useEffect(() => {
		let annule = false;

		fetch(API_METEO_URL)
			.then((reponse) => {
				if (!reponse.ok) throw new Error();
				return reponse.json();
			})
			.then((donnees) => {
				if (annule) return;
				setMeteo({
					temperature: Math.round(donnees.current.temperature_2m),
					codeTemps: donnees.current.weather_code,
				});
			})
			.catch(() => {
				if (!annule) setErreur(true);
			});

		return () => {
			annule = true;
		};
	}, []);

	if (erreur || !meteo) return null;

	const Icone = iconePourCode(meteo.codeTemps);

	return (
		<div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-full text-sm font-semibold text-slate-600 shadow-sm">
			<Icone size={18} className="text-sky-500" />
			{meteo.temperature}°C à Metz
		</div>
	);
}
