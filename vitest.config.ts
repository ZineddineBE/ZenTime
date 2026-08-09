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
		// Par défaut "node" (routes API) ; les tests de composants passent en
		// jsdom via le pragma `// @vitest-environment jsdom` en tête de fichier.
		environment: "node",
		include: ["**/*.test.ts", "**/*.test.tsx"],
		exclude: ["node_modules/**", ".next/**"],
		setupFiles: ["./vitest.setup.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "lcov"],
			include: ["app/api/**/route.ts", "lib/**/*.ts", "app/components/**/*.tsx"],
		},
	},
});
