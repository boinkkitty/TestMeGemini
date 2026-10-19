import { expect, test, type Page } from "@playwright/test";

import {
  createAuthenticatedChapter,
  loginThroughUi,
  signUpThroughUi,
  uniqueCredentials,
} from "./support/fixtures";

async function authenticate(page: Page) {
  const credentials = uniqueCredentials("errors");
  await signUpThroughUi(page, credentials);
  await loginThroughUi(page, credentials);
}

test("chapter load failures are not shown as empty data and can be retried", async ({ page }) => {
  await authenticate(page);
  let shouldFail = true;
  let requests = 0;
  await page.route("**/api/v1/chapters/", async (route) => {
    requests += 1;
    if (shouldFail) {
      await route.fulfill({ status: 500, json: { detail: "broken" } });
    } else {
      await route.fulfill({ status: 200, json: [] });
    }
  });

  await page.goto("/chapters");
  await expect(page.getByText("Unable to load chapters.")).toBeVisible();
  await expect(page.getByText("No chapters yet")).toBeHidden();

  shouldFail = false;
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByText("No chapters yet")).toBeVisible();
  expect(requests).toBeGreaterThanOrEqual(2);
});

test("attempt list and detail failures remain distinct from empty results", async ({ page }) => {
  await authenticate(page);
  let shouldFail = true;
  await page.route("**/api/v1/attempts/", async (route) => {
    if (shouldFail) {
      await route.fulfill({ status: 503, json: { detail: "unavailable" } });
    } else {
      await route.fulfill({ status: 200, json: [] });
    }
  });

  await page.goto("/attempts");
  await expect(page.getByText("Unable to load attempts.")).toBeVisible();
  await expect(page.getByText("No attempts yet")).toBeHidden();
  shouldFail = false;
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByText("No attempts yet")).toBeVisible();
});

test("dashboard user failure is visible and retryable", async ({ page }) => {
  await authenticate(page);
  let shouldFail = true;
  await page.route("**/api/v1/users/me/", async (route) => {
    if (shouldFail) {
      await route.fulfill({ status: 500, json: { detail: "broken" } });
    } else {
      await route.fulfill({
        status: 200,
        json: { id: 1, username: "Recovered User", email: "recovered@example.com" },
      });
    }
  });

  await page.goto("/dashboard");
  await expect(page.getByText("Unable to load dashboard.")).toBeVisible();
  shouldFail = false;
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByText(/Recovered User/)).toBeVisible();
});

test("quiz submission failures restore the submit control and explain the failure", async ({ page }) => {
  await authenticate(page);
  await createAuthenticatedChapter(page);
  await page.goto("/quiz");
  await page.getByRole("button", { name: /QA Functional Chapter/ }).click();

  await page.getByRole("button", { name: /Four/ }).click();
  await page.getByRole("button", { name: "Next →" }).click();
  await page.getByRole("button", { name: /Two/ }).click();
  await page.getByRole("button", { name: /Three/ }).click();
  await page.getByRole("button", { name: "Next →" }).click();
  await page.getByRole("button", { name: /True/ }).click();

  await page.route("**/api/v1/attempts/", (route) =>
    route.fulfill({ status: 500, json: { detail: "submission failed" } }),
  );
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("Unable to submit quiz. Please try again.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit" })).toBeEnabled();
});
