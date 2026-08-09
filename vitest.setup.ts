import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Démonte les composants montés par React Testing Library après chaque test,
// pour éviter qu'un test de composant pollue le suivant.
afterEach(() => {
	cleanup();
});
