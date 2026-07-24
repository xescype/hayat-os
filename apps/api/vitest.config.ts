import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./test/setup.ts"],
    include: ["src/**/*.test.ts"],
    exclude: ["src/**/*.itest.ts", "node_modules/**"],
  },
});
