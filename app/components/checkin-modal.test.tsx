// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
	useRouter: () => ({ refresh: refreshMock }),
}));

import CheckInModal from "./checkin-modal";

beforeEach(() => {
	vi.clearAllMocks();
	vi.stubGlobal("fetch", vi.fn());
});

describe("CheckInModal", () => {
	it("la modale est fermée par défaut", () => {
		render(<CheckInModal />);

		expect(screen.queryByText("Valider mon état")).not.toBeInTheDocument();
	});

	it("ouvre la modale au clic sur le bouton déclencheur", async () => {
		const utilisateur = userEvent.setup();
		render(<CheckInModal />);

		await utilisateur.click(
			screen.getByRole("button", { name: "Comment vous sentez-vous ?" }),
		);

		expect(screen.getByText("Valider mon état")).toBeInTheDocument();
	});

	it("le bouton de validation est désactivé tant qu'aucune humeur n'est choisie", async () => {
		const utilisateur = userEvent.setup();
		render(<CheckInModal />);
		await utilisateur.click(
			screen.getByRole("button", { name: "Comment vous sentez-vous ?" }),
		);

		expect(screen.getByText("Valider mon état")).toBeDisabled();

		await utilisateur.click(screen.getByRole("button", { name: "Zen" }));

		expect(screen.getByText("Valider mon état")).toBeEnabled();
	});

	it("envoie l'humeur choisie (POST /api/suivi-stress), ferme la modale et rafraîchit", async () => {
		const fetchMock = fetch as unknown as Mock;
		fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });
		const utilisateur = userEvent.setup();

		render(<CheckInModal />);
		await utilisateur.click(
			screen.getByRole("button", { name: "Comment vous sentez-vous ?" }),
		);
		await utilisateur.click(screen.getByRole("button", { name: "Zen" }));
		await utilisateur.click(screen.getByText("Valider mon état"));

		expect(fetchMock).toHaveBeenCalledWith(
			"/api/suivi-stress",
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify({ humeur: "zen" }),
			}),
		);
		await waitFor(() =>
			expect(screen.queryByText("Valider mon état")).not.toBeInTheDocument(),
		);
		expect(refreshMock).toHaveBeenCalled();
	});

	it("affiche une erreur et laisse la modale ouverte si l'appel échoue", async () => {
		const fetchMock = fetch as unknown as Mock;
		fetchMock.mockResolvedValue({ ok: false });
		const utilisateur = userEvent.setup();

		render(<CheckInModal />);
		await utilisateur.click(
			screen.getByRole("button", { name: "Comment vous sentez-vous ?" }),
		);
		await utilisateur.click(screen.getByRole("button", { name: "Bien" }));
		await utilisateur.click(screen.getByText("Valider mon état"));

		expect(
			await screen.findByText("Impossible d'enregistrer votre état, réessayez."),
		).toBeInTheDocument();
		expect(screen.getByText("Valider mon état")).toBeInTheDocument();
		expect(refreshMock).not.toHaveBeenCalled();
	});

	it("ferme la modale au clic sur la croix, sans appeler l'API", async () => {
		const utilisateur = userEvent.setup();
		render(<CheckInModal />);
		await utilisateur.click(
			screen.getByRole("button", { name: "Comment vous sentez-vous ?" }),
		);

		await utilisateur.click(screen.getByRole("button", { name: "Fermer" }));

		expect(screen.queryByText("Valider mon état")).not.toBeInTheDocument();
		expect(fetch).not.toHaveBeenCalled();
	});
});
