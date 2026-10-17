import path from "node:path";

import { expect, test } from "@playwright/test";

import { loginThroughUi, signUpThroughUi, uniqueCredentials } from "./support/fixtures";

test("upload rejects invalid input, reports malformed PDFs, and resets after success", async ({ page }) => {
  const credentials = uniqueCredentials("upload");
  await signUpThroughUi(page, credentials);
  await loginThroughUi(page, credentials);
  await page.goto("/upload");

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("notes") });
  await expect(page.getByText("Only PDF files are accepted.")).toBeVisible();

  await page.getByLabel("Chapter title").fill("Malformed PDF");
  await page.getByLabel("Subject / Category").fill("QA");
  await fileInput.setInputFiles(path.resolve(process.cwd(), "e2e/fixtures/invalid.pdf"));
  await page.getByRole("button", { name: "Generate questions" }).click();
  await expect(page.getByText(/PDF|extract|process|valid/i).last()).toBeVisible();

  for (const value of ["10", "20", "30", "50"]) {
    await page.getByLabel("No. of questions").selectOption(value);
    await expect(page.getByLabel("No. of questions")).toHaveValue(value);
  }
  await page.getByLabel("No. of questions").selectOption("20");
  await page.getByLabel("Description").fill("Full upload journey summary");

  let multipart = "";
  await page.route("**/api/v1/chapter-generations/**", async (route) => {
    multipart = route.request().postData() ?? "";
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({ status: 201, json: { chapter_id: 12, question_ids: [] } });
  });
  await page.getByRole("button", { name: "Generate questions" }).click();
  await expect(page.getByText("Generating…")).toBeVisible();
  await expect(page.getByText("Chapter and questions generated successfully!")).toBeVisible();
  expect(multipart).toContain("Full upload journey summary");
  expect(multipart).toContain("20");
  await expect(page.getByLabel("Chapter title")).toHaveValue("");
  await expect(page.getByLabel("Subject / Category")).toHaveValue("");
  await expect(page.getByLabel("Description")).toHaveValue("");
  await expect(page.getByLabel("No. of questions")).toHaveValue("30");
  await expect(page.getByRole("button", { name: "Remove invalid.pdf" })).toBeHidden();
});
