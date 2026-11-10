import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/server.ts"],
      reporter: ["text", "lcov"],
      // TODO TP 2 : des seuils (thresholds) de 80 % pour les lignes (lines) et les branches (branches).
      // En dessous, la commande échoue, et le pipeline aussi.
      thresholds: {
        lines: 80,
        branches: 80,
      },
    },
  },
});
