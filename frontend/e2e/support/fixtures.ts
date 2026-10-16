import { expect, type Page } from "@playwright/test";

export type Credentials = {
  username: string;
  email: string;
  password: string;
};

export function uniqueCredentials(prefix = "qa"): Credentials {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return {
    username: `${prefix}_${suffix}`,
    email: `${prefix}.${suffix}@example.com`,
    password: "FunctionalQA!2026Strong",
  };
}

export async function signUpThroughUi(page: Page, credentials: Credentials) {
  await page.goto("/signup");
  await page.getByLabel("Username").fill(credentials.username);
  await page.getByLabel("Email").fill(credentials.email);
  await page.getByLabel("Password").fill(credentials.password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/login$/);
}

export async function loginThroughUi(page: Page, credentials: Credentials) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(credentials.email);
  await page.getByLabel("Password").fill(credentials.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

export async function createAuthenticatedChapter(page: Page) {
  const csrfResponse = await page.request.get("/api/v1/auth/csrf/");
  expect(csrfResponse.status()).toBe(204);
  const csrfCookie = (await page.context().cookies()).find(
    (cookie) => cookie.name === "csrftoken",
  );
  expect(csrfCookie).toBeTruthy();

  const response = await page.request.post("/api/v1/chapters/", {
    headers: { "X-CSRFToken": csrfCookie!.value },
    data: {
      title: "QA Functional Chapter",
      description: "Created deterministically for browser QA",
      category: "QA",
      questions: [
        {
          question_text: "Which number is even?",
          question_type: "MCQ",
          choices: [
            { text: "Three", is_correct: false },
            { text: "Four", is_correct: true },
            { text: "Five", is_correct: false },
          ],
        },
        {
          question_text: "Select the prime numbers.",
          question_type: "MRQ",
          choices: [
            { text: "Two", is_correct: true },
            { text: "Three", is_correct: true },
            { text: "Four", is_correct: false },
          ],
        },
        {
          question_text: "Paris is the capital of France.",
          question_type: "TF",
          choices: [
            { text: "True", is_correct: true },
            { text: "False", is_correct: false },
          ],
        },
      ],
    },
  });
  expect(response.status()).toBe(201);
  return response.json();
}
