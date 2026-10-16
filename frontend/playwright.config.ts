import os from "node:os";
import path from "node:path";

import { defineConfig, devices } from "@playwright/test";

const backendPort = Number(process.env.TESTME_E2E_BACKEND_PORT ?? "18111");
const frontendPort = Number(process.env.TESTME_E2E_FRONTEND_PORT ?? "13111");
const databasePath =
  process.env.TESTME_E2E_DB ?? path.join(os.tmpdir(), "testmegemini-e2e.sqlite3");

process.env.TESTME_E2E_BACKEND_PORT = String(backendPort);
process.env.TESTME_E2E_FRONTEND_PORT = String(frontendPort);
process.env.TESTME_E2E_DB = databasePath;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://127.0.0.1:${frontendPort}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "../scripts/run-e2e-backend.sh",
      url: `http://127.0.0.1:${backendPort}/api/v1/auth/csrf/`,
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        ...process.env,
        TESTME_E2E_BACKEND_PORT: String(backendPort),
        TESTME_E2E_DB: databasePath,
      },
    },
    {
      command: "../scripts/run-e2e-frontend.sh",
      url: `http://127.0.0.1:${frontendPort}/login`,
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        ...process.env,
        TESTME_E2E_BACKEND_PORT: String(backendPort),
        TESTME_E2E_FRONTEND_PORT: String(frontendPort),
      },
    },
  ],
});
