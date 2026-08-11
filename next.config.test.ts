import { describe, it, expect } from "vitest";
import nextConfig from "./next.config";

describe("next.config headers (sécurité)", () => {
	it("applique les en-têtes de sécurité à toutes les routes", async () => {
		const regles = await nextConfig.headers!();

		expect(regles).toHaveLength(1);
		expect(regles[0].source).toBe("/:path*");

		const cles = regles[0].headers.map((h) => h.key);
		expect(cles).toEqual(
			expect.arrayContaining([
				"Content-Security-Policy",
				"X-Content-Type-Options",
				"X-Frame-Options",
				"Referrer-Policy",
			]),
		);
	});

	it("la CSP autorise l'API météo tierce consommée par WeatherWidget", async () => {
		const regles = await nextConfig.headers!();
		const csp = regles[0].headers.find((h) => h.key === "Content-Security-Policy")!.value;

		expect(csp).toContain("connect-src 'self' https://api.open-meteo.com");
	});

	it("la CSP interdit l'affichage du site dans une iframe (frame-ancestors 'none')", async () => {
		const regles = await nextConfig.headers!();
		const csp = regles[0].headers.find((h) => h.key === "Content-Security-Policy")!.value;

		expect(csp).toContain("frame-ancestors 'none'");
	});

	it("X-Content-Type-Options vaut nosniff", async () => {
		const regles = await nextConfig.headers!();
		const header = regles[0].headers.find((h) => h.key === "X-Content-Type-Options");

		expect(header?.value).toBe("nosniff");
	});
});
