import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        include: ["src/tests/**/*.test.ts", "src/**/*.spec.ts"],
        // setupFiles: ["./tests/setup.ts"],
        coverage: {
            // provider: "c8",
            // exclude: ["tests/**/*"],
        },
    },
    esbuild: {
        target: "esnext",
    },
});
