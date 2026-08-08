import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	resolve: {
		alias: {
			"@": dirname,
		},
	},
	test: {
		environment: "node",
		include: ["**/*.test.ts"],
		exclude: ["node_modules/**", ".next/**"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "lcov"],
			// Périmètre initial : les routes API et la logique métier pure.
			// Les pages/composants React seront couverts par une itération suivante.
			include: ["app/api/**/route.ts", "lib/**/*.ts"],
		},
	},
});
