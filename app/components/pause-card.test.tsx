// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
	useRouter: () => ({ refresh: refreshMock }),
}));

import PauseCard from "./pause-card";

beforeEach(() => {
	vi.clearAllMocks();
	vi.stubGlobal("fetch", vi.fn());
});

describe("PauseCard", () => {
	it("affiche 'Lancer' quand aucune pause n'est en cours", () => {
		render(
			<PauseCard idType={1} titre="Étirement" description="desc" couleur="emerald" />,
		);

		expect(screen.getByRole("button", { name: "Lancer" })).toBeInTheDocument();
	});

	it("affiche 'Terminer' quand une pause est déjà en cours", () => {
		render(
			<PauseCard
				idType={1}
				titre="Étirement"
				description="desc"
				couleur="emerald"
				pauseEnCoursId={42}
			/>,
		);

		expect(screen.getByRole("button", { name: "Terminer" })).toBeInTheDocument();
	});

	it("démarre une pause au clic sur 'Lancer' (POST /api/pauses)", async () => {
		const fetchMock = fetch as unknown as Mock;
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({ id_pause: 7 }),
		});
		const utilisateur = userEvent.setup();

		render(
			<PauseCard idType={1} titre="Étirement" description="desc" couleur="emerald" />,
		);
		await utilisateur.click(screen.getByRole("button", { name: "Lancer" }));

		expect(fetchMock).toHaveBeenCalledWith(
			"/api/pauses",
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify({ id_type: 1 }),
			}),
		);
		await waitFor(() =>
			expect(screen.getByRole("button", { name: "Terminer" })).toBeInTheDocument(),
		);
		expect(refreshMock).toHaveBeenCalled();
	});

	it("termine la pause au clic sur 'Terminer' (PATCH /api/pauses/:id)", async () => {
		const fetchMock = fetch as unknown as Mock;
		fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });
		const utilisateur = userEvent.setup();

		render(
			<PauseCard
				idType={1}
				titre="Étirement"
				description="desc"
				couleur="emerald"
				pauseEnCoursId={42}
			/>,
		);
		await utilisateur.click(screen.getByRole("button", { name: "Terminer" }));

		expect(fetchMock).toHaveBeenCalledWith("/api/pauses/42", { method: "PATCH" });
		await waitFor(() =>
			expect(screen.getByRole("button", { name: "Lancer" })).toBeInTheDocument(),
		);
		expect(refreshMock).toHaveBeenCalled();
	});

	it("affiche un message d'erreur si l'appel API échoue", async () => {
		const fetchMock = fetch as unknown as Mock;
		fetchMock.mockResolvedValue({ ok: false });
		const utilisateur = userEvent.setup();

		render(
			<PauseCard idType={1} titre="Étirement" description="desc" couleur="emerald" />,
		);
		await utilisateur.click(screen.getByRole("button", { name: "Lancer" }));

		expect(
			await screen.findByText("Impossible de démarrer la pause"),
		).toBeInTheDocument();
		// Le bouton reste sur "Lancer" puisque la pause n'a pas été créée.
		expect(screen.getByRole("button", { name: "Lancer" })).toBeInTheDocument();
	});
});
