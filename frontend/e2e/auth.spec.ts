import { expect, test } from "@playwright/test";

import { signUpThroughUi, uniqueCredentials } from "./support/fixtures";

test("signup, authentication guards, password visibility, login, and logout", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);

  const credentials = uniqueCredentials("auth");
  await signUpThroughUi(page, credentials);

  await page.getByLabel("Email").fill(credentials.email);
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByText(/Login failed:/)).toBeVisible();

  const password = page.getByLabel("Password");
  await password.fill(credentials.password);
  await expect(password).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Show" }).click();
  await expect(password).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Hide" }).click();
  await expect(password).toHaveAttribute("type", "password");

  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/login");
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.getByText("Log Out").click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/chapters");
  await expect(page).toHaveURL(/\/login$/);
});
