import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./test/integration-setup.ts"],
    include: ["src/**/*.itest.ts"],
    globalSetup: ["./test/global-setup.ts"],
    fileParallelism: false, // tek DB, sirali kos
    hookTimeout: 30000,
  },
});
