// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SupportButton from "./support-button";

beforeEach(() => {
	vi.clearAllMocks();
	vi.stubGlobal("fetch", vi.fn());
	// jsdom n'implémente pas la navigation réelle : on remplace window.location
	// par un objet simple pour pouvoir observer l'affectation de `.href`.
	Object.defineProperty(window, "location", {
		value: { href: "" },
		writable: true,
	});
});

describe("SupportButton", () => {
	it("le menu des montants est fermé par défaut", () => {
		render(<SupportButton />);

		expect(screen.queryByText("3€")).not.toBeInTheDocument();
	});

	it("ouvre le menu des montants au clic sur 'Soutenir'", async () => {
		const utilisateur = userEvent.setup();
		render(<SupportButton />);

		await utilisateur.click(screen.getByRole("button", { name: /Soutenir/ }));

		expect(screen.getByText("3€")).toBeInTheDocument();
		expect(screen.getByText("5€")).toBeInTheDocument();
		expect(screen.getByText("10€")).toBeInTheDocument();
	});

	it("crée une session Stripe (POST /api/dons) et redirige vers l'URL reçue", async () => {
		const fetchMock = fetch as unknown as Mock;
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({ url: "https://checkout.stripe.com/cs_test_123" }),
		});
		const utilisateur = userEvent.setup();

		render(<SupportButton />);
		await utilisateur.click(screen.getByRole("button", { name: /Soutenir/ }));
		await utilisateur.click(screen.getByText("5€"));

		expect(fetchMock).toHaveBeenCalledWith(
			"/api/dons",
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify({ montant: 5 }),
			}),
		);
		expect(window.location.href).toBe("https://checkout.stripe.com/cs_test_123");
	});

	it("affiche une erreur et ne redirige pas si l'appel échoue", async () => {
		const fetchMock = fetch as unknown as Mock;
		fetchMock.mockResolvedValue({ ok: false });
		const utilisateur = userEvent.setup();

		render(<SupportButton />);
		await utilisateur.click(screen.getByRole("button", { name: /Soutenir/ }));
		await utilisateur.click(screen.getByText("10€"));

		expect(
			await screen.findByText("Impossible de démarrer le paiement"),
		).toBeInTheDocument();
		expect(window.location.href).toBe("");
	});
});
