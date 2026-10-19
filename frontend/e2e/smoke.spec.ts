import path from "node:path";

import { expect, test } from "@playwright/test";

test("starts the full stack with an isolated database", async ({ page, request }) => {
  const databasePath = process.env.TESTME_E2E_DB;
  expect(databasePath).toBeTruthy();
  expect(path.resolve(databasePath!)).not.toBe(
    path.resolve(__dirname, "../../backend/db.sqlite3"),
  );

  await page.goto("/login");
  await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();

  const csrf = await request.get("/api/v1/auth/csrf/");
  expect(csrf.status()).toBe(204);
  expect(csrf.headers()["set-cookie"]).toContain("csrftoken=");
});
