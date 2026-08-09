// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import WeatherWidget from "./weather-widget";

beforeEach(() => {
	vi.clearAllMocks();
	vi.stubGlobal("fetch", vi.fn());
});

describe("WeatherWidget", () => {
	it("n'affiche rien tant que la météo n'est pas chargée", () => {
		(fetch as unknown as Mock).mockReturnValue(new Promise(() => {})); // jamais résolue

		const { container } = render(<WeatherWidget />);

		expect(container).toBeEmptyDOMElement();
	});

	it("affiche la température une fois la météo reçue", async () => {
		(fetch as unknown as Mock).mockResolvedValue({
			ok: true,
			json: async () => ({ current: { temperature_2m: 18.4, weather_code: 0 } }),
		});

		render(<WeatherWidget />);

		expect(await screen.findByText("18°C à Metz")).toBeInTheDocument();
		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining("api.open-meteo.com/v1/forecast"),
		);
		expect(fetch).toHaveBeenCalledWith(expect.stringContaining("latitude=49.1193"));
	});

	it("n'affiche rien si la réponse n'est pas OK", async () => {
		(fetch as unknown as Mock).mockResolvedValue({ ok: false });

		const { container } = render(<WeatherWidget />);

		await waitFor(() => expect(container).toBeEmptyDOMElement());
	});

	it("n'affiche rien si l'appel réseau échoue", async () => {
		(fetch as unknown as Mock).mockRejectedValue(new Error("network error"));

		const { container } = render(<WeatherWidget />);

		await waitFor(() => expect(container).toBeEmptyDOMElement());
	});
});
