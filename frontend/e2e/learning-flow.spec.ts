import { expect, test } from "@playwright/test";

import {
  createAuthenticatedChapter,
  loginThroughUi,
  signUpThroughUi,
  uniqueCredentials,
} from "./support/fixtures";

test("complete chapter, quiz, attempt review, and soft-delete journey", async ({ page }) => {
  const credentials = uniqueCredentials("learning");
  await signUpThroughUi(page, credentials);
  await loginThroughUi(page, credentials);
  await createAuthenticatedChapter(page);

  await page.goto("/dashboard");
  await expect(page.getByText("Total Chapters").locator("..").getByText("1", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "All chapters →" }).click();
  await expect(page).toHaveURL(/\/chapters$/);

  await expect(page.getByText("3 questions")).toBeVisible();
  await page.getByPlaceholder("Search title…").fill("missing");
  await expect(page.getByText("No chapters match your filters")).toBeVisible();
  await page.getByPlaceholder("Search title…").fill("functional");
  await expect(page.getByText("QA Functional Chapter")).toBeVisible();

  await page.getByRole("button", { name: "Browse" }).click();
  await expect(page.getByText("Question 1 of 3")).toBeVisible();
  await page.getByRole("button", { name: "Next →" }).click();
  await expect(page.getByText("Question 2 of 3")).toBeVisible();
  await page.getByRole("button", { name: "← Previous" }).click();
  await page.getByRole("button", { name: "← Back" }).click();

  await page.getByRole("button", { name: "Quiz →" }).click();
  await page.getByRole("button", { name: /QA Functional Chapter/ }).click();
  await page.getByRole("button", { name: /Three/ }).click();
  await page.getByRole("button", { name: /Four/ }).click();
  await page.getByRole("button", { name: "Next →" }).click();
  await page.getByRole("button", { name: /Two/ }).click();
  await page.getByRole("button", { name: /Three/ }).click();
  await page.getByRole("button", { name: /Two/ }).click();
  await page.getByRole("button", { name: /Two/ }).click();
  await page.getByRole("button", { name: "Next →" }).click();
  await page.getByRole("button", { name: /True/ }).click();
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("100% · Great")).toBeVisible();
  await expect(page.getByText("✓ Correct")).toBeVisible();

  await page.getByText("Attempts", { exact: true }).click();
  await expect(page).toHaveURL(/\/attempts$/);
  await page.getByPlaceholder("Search title…").fill("missing");
  await expect(page.getByText("No attempts match your filters")).toBeVisible();
  await page.getByPlaceholder("Search title…").fill("functional");
  await page.getByText("QA Functional Chapter").click();
  await expect(page.getByText("1 / 3")).toBeVisible();
  await page.getByRole("button", { name: "Next →" }).click();
  await expect(page.getByText("2 / 3")).toBeVisible();
  await page.getByRole("button", { name: "← Back" }).click();

  await page.getByText("Chapters", { exact: true }).click();
  await page.getByTitle("Delete chapter").click();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByText("QA Functional Chapter")).toBeVisible();
  await page.getByTitle("Delete chapter").click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByText("No chapters yet")).toBeVisible();

  await page.getByText("Attempts", { exact: true }).click();
  await expect(page.getByText("QA Functional Chapter")).toBeVisible();
});
