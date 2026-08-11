import type { NextConfig } from "next";

// Content-Security-Policy : limite les sources autorisées à charger/exécuter
// sur le site, pour réduire l'impact d'une éventuelle faille XSS.
//   - 'unsafe-inline' sur script-src : Next.js injecte lui-même des scripts
//     inline (données d'hydratation React). Le supprimer casserait
//     l'application. C'est un compromis assumé et courant en première mise
//     en place de CSP (l'alternative plus stricte, un nonce par requête,
//     demande de générer et propager ce nonce depuis proxy.ts).
//   - connect-src autorise l'API météo tierce (Open-Meteo) consommée depuis
//     le composant WeatherWidget, en plus de l'API interne ("self").
// En dev, Next.js/React utilisent eval() pour le rechargement à chaud
// (Fast Refresh) : sans 'unsafe-eval' la CSP casse le hot-reload en local.
// React ne s'en sert jamais en production, donc on ne l'autorise pas là.
const scriptSrcEval = process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'";

const CSP = [
	"default-src 'self'",
	`script-src 'self' 'unsafe-inline'${scriptSrcEval}`,
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data:",
	"font-src 'self' data:",
	"connect-src 'self' https://api.open-meteo.com",
	"frame-ancestors 'none'",
	"base-uri 'self'",
	"form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{ key: "Content-Security-Policy", value: CSP },
					{ key: "X-Content-Type-Options", value: "nosniff" },
					{ key: "X-Frame-Options", value: "DENY" },
					{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
				],
			},
		];
	},
};

export default nextConfig;
