import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    // Força testes de integração a rodarem sequencialmente para evitar conflitos no DB
    sequence: {
      hooks: "stack",
    },
    fileParallelism: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "tests/",
        "**/*.spec.ts",
        "**/*.test.ts",
        "**/types.ts",
        "**/*.d.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@core": path.resolve(__dirname, "./src/core"),
      "@app": path.resolve(__dirname, "./src/app"),
      "@infra": path.resolve(__dirname, "./src/infra"),
      "@interfaces": path.resolve(__dirname, "./src/interfaces"),
      "@shared": path.resolve(__dirname, "./src/shared"),
    },
  },
});
