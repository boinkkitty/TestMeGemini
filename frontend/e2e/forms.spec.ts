import path from "node:path";

import { expect, test } from "@playwright/test";

import { uniqueCredentials } from "./support/fixtures";

async function registerAndLogin(page: import("@playwright/test").Page) {
  const credentials = uniqueCredentials("forms");
  await page.goto("/signup");
  await page.locator('input[name="username"]').fill(credentials.username);
  await page.locator('input[name="email"]').fill(credentials.email);
  await page.locator('input[name="password"]').fill(credentials.password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.locator('input[name="email"]').fill(credentials.email);
  await page.locator('input[name="password"]').fill(credentials.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("shows accessible required-field feedback on auth forms", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByText("Email is required.")).toBeVisible();
  await expect(page.getByText("Password is required.")).toBeVisible();

  await page.goto("/signup");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Username is required.")).toBeVisible();
  await expect(page.getByText("Email is required.")).toBeVisible();
  await expect(page.getByText("Password is required.")).toBeVisible();

  await expect(page.getByLabel("Username")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
});

test("clears upload errors, reselects a removed file, and sends description", async ({
  page,
}) => {
  await registerAndLogin(page);
  await page.goto("/upload");

  await page.getByRole("button", { name: "Generate questions" }).click();
  await expect(page.getByText("Please enter a chapter title.")).toBeVisible();
  await page.getByLabel("Chapter title").fill("QA Upload");
  await expect(page.getByText("Please enter a chapter title.")).toBeHidden();

  await page.getByRole("button", { name: "Generate questions" }).click();
  await expect(page.getByText("Please enter a category.")).toBeVisible();
  await page.getByLabel("Subject / Category").fill("QA");
  await expect(page.getByText("Please enter a category.")).toBeHidden();

  await page.getByRole("button", { name: "Generate questions" }).click();
  await expect(page.getByText("Please upload at least one PDF file.")).toBeVisible();

  const fixture = path.resolve(process.cwd(), "e2e/fixtures/invalid.pdf");
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(fixture);
  await expect(page.getByText("Please upload at least one PDF file.")).toBeHidden();
  await expect(page.getByRole("button", { name: "Remove invalid.pdf" })).toBeVisible();

  await page.getByRole("button", { name: "Remove invalid.pdf" }).click();
  await expect(page.getByRole("button", { name: "Remove invalid.pdf" })).toBeHidden();
  await fileInput.setInputFiles(fixture);
  await expect(page.getByRole("button", { name: "Remove invalid.pdf" })).toBeVisible();

  await page.getByLabel("No. of questions").selectOption("10");
  await page.getByLabel("Description").fill("My browser supplied summary");

  let requestBody = "";
  await page.route("**/api/v1/chapter-generations/**", async (route) => {
    requestBody = route.request().postData() ?? "";
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ chapter_id: 42, question_ids: [] }),
    });
  });

  await page.getByRole("button", { name: "Generate questions" }).click();
  await expect(page.getByText("Chapter and questions generated successfully!")).toBeVisible();
  expect(requestBody).toContain('name="description"');
  expect(requestBody).toContain("My browser supplied summary");
  expect(requestBody).toContain('name="question_count"');
  expect(requestBody).toContain("10");
});
