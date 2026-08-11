import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { estBloque, enregistrerEchec, reinitialiser } from "./rate-limit";

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date("2026-01-01T10:00:00Z"));
});

afterEach(() => {
	vi.useRealTimers();
});

describe("rate-limit", () => {
	it("n'est pas bloqué avant toute tentative", () => {
		expect(estBloque("nouveau@zentime.fr")).toBe(false);
	});

	it("n'est pas bloqué en dessous du seuil (5 échecs autorisés)", () => {
		const email = "test1@zentime.fr";
		for (let i = 0; i < 4; i++) enregistrerEchec(email);

		expect(estBloque(email)).toBe(false);
	});

	it("est bloqué à partir du 5e échec", () => {
		const email = "test2@zentime.fr";
		for (let i = 0; i < 5; i++) enregistrerEchec(email);

		expect(estBloque(email)).toBe(true);
	});

	it("le blocage se lève après expiration de la fenêtre (15 minutes)", () => {
		const email = "test3@zentime.fr";
		for (let i = 0; i < 5; i++) enregistrerEchec(email);
		expect(estBloque(email)).toBe(true);

		vi.advanceTimersByTime(15 * 60 * 1000 + 1);

		expect(estBloque(email)).toBe(false);
	});

	it("réinitialiser() lève immédiatement le blocage (ex. après un login réussi)", () => {
		const email = "test4@zentime.fr";
		for (let i = 0; i < 5; i++) enregistrerEchec(email);
		expect(estBloque(email)).toBe(true);

		reinitialiser(email);

		expect(estBloque(email)).toBe(false);
	});

	it("le compteur est indépendant par clé (email)", () => {
		const emailA = "a@zentime.fr";
		const emailB = "b@zentime.fr";
		for (let i = 0; i < 5; i++) enregistrerEchec(emailA);

		expect(estBloque(emailA)).toBe(true);
		expect(estBloque(emailB)).toBe(false);
	});

	it("un échec après expiration de la fenêtre redémarre le compteur à 1", () => {
		const email = "test5@zentime.fr";
		for (let i = 0; i < 5; i++) enregistrerEchec(email);
		expect(estBloque(email)).toBe(true);

		vi.advanceTimersByTime(15 * 60 * 1000 + 1);
		enregistrerEchec(email); // 1 seul échec dans la nouvelle fenêtre

		expect(estBloque(email)).toBe(false);
	});
});
