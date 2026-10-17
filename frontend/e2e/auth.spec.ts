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

test("login does not expose an HTML server error", async ({ page }) => {
  await page.route("**/api/v1/auth/login/", (route) =>
    route.fulfill({
      status: 403,
      contentType: "text/html",
      body: "<!DOCTYPE html><html><body>CSRF debug details</body></html>",
    }),
  );

  await page.goto("/login");
  await page.getByLabel("Email").fill("user@example.com");
  await page.getByLabel("Password").fill("invalid-password");
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(
    page.getByText(
      "Login failed: The server returned an unexpected response. Please try again.",
    ),
  ).toBeVisible();
  await expect(page.getByText(/DOCTYPE|CSRF debug details/)).toBeHidden();
});

test("signup does not expose an HTML server error", async ({ page }) => {
  await page.route("**/api/v1/users/", (route) =>
    route.fulfill({
      status: 403,
      contentType: "text/html",
      body: "<!DOCTYPE html><html><body>CSRF debug details</body></html>",
    }),
  );

  await page.goto("/signup");
  await page.getByLabel("Username").fill("tester");
  await page.getByLabel("Email").fill("tester@example.com");
  await page.getByLabel("Password").fill("invalid-password");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(
    page.getByText(
      "Sign up failed: The server returned an unexpected response. Please try again.",
    ),
  ).toBeVisible();
  await expect(page.getByText(/DOCTYPE|CSRF debug details/)).toBeHidden();
});
