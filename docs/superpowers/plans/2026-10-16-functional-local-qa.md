# Functional Local QA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make TestMeGemini reliably runnable locally, repair the QA-discovered functional gaps, and provide deterministic full-stack Playwright coverage.

**Architecture:** Preserve the Next.js same-origin proxy and Django REST architecture. Add small contract fields and honest UI state handling, then run Playwright against dedicated Django and Next.js processes backed by an isolated SQLite database; mock only the external Gemini generation boundary.

**Tech Stack:** Django 5.2, Django REST Framework, SimpleJWT, SQLite, Next.js 15+, React 19, TypeScript, ESLint, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-16-functional-local-qa-design.md`

## Global Constraints

- Local Django defaults to `127.0.0.1:8001`; Next.js defaults to `127.0.0.1:3000`; both ports remain configurable.
- Browser API calls remain same-origin through `/api/v1/*`; do not replace the proxy or cookie JWT authentication.
- Playwright uses a temporary SQLite database and never calls Gemini.
- Preserve all pre-existing staged and unstaged user changes; edit overlapping files in place.
- Commit a task only when its changes can be isolated from pre-existing user edits; otherwise leave the overlapping file uncommitted and report it rather than absorbing the user's work into an agent commit.
- Keep answer correctness secret before attempt submission and available only from immutable attempt snapshots afterward.
- Do not alter the visual design or navigation structure.

## Review Focus

- A machine with port 8000 occupied must still start the app on the documented defaults; covered by the local-run smoke test in Task 1.
- A missing Gemini key must not prevent login, browsing, or quizzes; generation must return a clear error; covered by Django tests in Task 2.
- Empty arrays and API failures must render different UI states; covered by Playwright response-failure tests in Task 5.
- Removing and reselecting the same PDF filename must work; covered by the upload Playwright test in Task 4.
- A deleted chapter must disappear while its attempt snapshots remain reviewable; covered by the learning-flow Playwright test in Task 6.

---

### Task 1: Reliable Local Runtime

**Files:**
- Create: `scripts/run-local.sh`
- Create: `scripts/check-local.sh`
- Modify: `Makefile`
- Modify: `.gitignore`
- Modify: `README.md`

**Interfaces:**
- Consumes: `backend/venv/bin/python`, `frontend/package.json`, optional `TESTME_BACKEND_PORT` and `TESTME_FRONTEND_PORT`.
- Produces: `make local-run`, `make local-check`, Django on port `8001` by default, Next.js on port `3000` by default.

- [ ] **Step 1: Write `scripts/check-local.sh` to assert the local runner contract**

The check must start the runner with explicit non-default test ports, wait for `/api/v1/auth/csrf/` and `/login`, assert successful responses, then terminate both child processes cleanly.

- [ ] **Step 2: Run the local check and verify it fails before the runner exists**

Run: `bash scripts/check-local.sh`

Expected: FAIL because `scripts/run-local.sh` or the Make target does not exist.

- [ ] **Step 3: Implement `scripts/run-local.sh` and Make targets**

The runner validates installed dependencies, migrates Django, starts both servers, forwards `API_URL` to Next.js, traps `INT`/`TERM`/`EXIT`, and stops both children. Add `local-run`, `local-check`, `test-backend`, `test-frontend`, `test-e2e`, and `test-all` targets without removing existing targets.

- [ ] **Step 4: Document setup, startup, port overrides, and test commands**

Keep the existing Gemini documentation and user edits. Explain that general app usage can run without a live model call, while PDF generation needs `GEMINI_API_KEY`.

- [ ] **Step 5: Verify the isolated local runner**

Run: `bash scripts/check-local.sh`

Expected: PASS with Django and Next.js health checks, followed by no listener remaining on the test ports.

- [ ] **Step 6: Commit only Task 1 files**

Commit message: `feat: add reliable local app runner`

### Task 2: Backend Chapter Contract and Optional Gemini Configuration

**Files:**
- Modify: `backend/api/settings.py`
- Modify: `backend/api/utils/ai.py`
- Modify: `backend/chapters/views.py`
- Modify: `backend/chapters/services.py`
- Modify: `backend/chapters/serializers.py`
- Modify: `backend/chapters/tests.py`

**Interfaces:**
- Consumes: multipart `description`, existing `title`, `category`, `question_count`, and files.
- Produces: `ChapterListSerializer.question_count: int`; `generate_chapter_from_files(..., description=None, ...)`; clear `AIServiceError` when no Gemini key is configured.

- [ ] **Step 1: Add failing Django tests**

Add tests named:

- `test_generation_prefers_supplied_description`
- `test_generation_falls_back_to_generated_description`
- `test_chapter_list_includes_question_count_without_n_plus_one_queries`
- `test_missing_gemini_key_fails_only_when_generation_is_called`

Assert the exact persisted description, count values, bounded query count, and client-safe error.

- [ ] **Step 2: Run the focused tests and verify they fail**

Run: `backend/venv/bin/python backend/manage.py test chapters.tests.ChapterQuestionAPITests api.tests -v 2`

Expected: FAIL on the new contract assertions.

- [ ] **Step 3: Implement the minimal backend contract changes**

Annotate active chapter lists with `Count("questions")`, expose a read-only integer count, pass description from both generation views, prefer trimmed user description over the generated fallback, default `GEMINI_API_KEY` to an empty string, and raise `AIServiceError("Gemini is not configured. Set GEMINI_API_KEY to generate questions.")` at call time.

- [ ] **Step 4: Run backend verification**

Run: `backend/venv/bin/python backend/manage.py test -v 2`

Run: `backend/venv/bin/python backend/manage.py makemigrations --check --dry-run`

Run: `backend/venv/bin/python backend/manage.py check`

Expected: all tests pass, no model changes, no system-check errors.

- [ ] **Step 5: Commit only Task 2 files**

Commit message: `fix: complete chapter generation contract`

### Task 3: Deterministic Playwright Harness

**Files:**
- Create: `frontend/playwright.config.ts`
- Create: `frontend/e2e/support/fixtures.ts`
- Create: `frontend/e2e/fixtures/invalid.pdf`
- Create: `scripts/run-e2e-backend.sh`
- Create: `scripts/run-e2e-frontend.sh`
- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: `TESTME_E2E_DB`, `TESTME_E2E_BACKEND_PORT`, `TESTME_E2E_FRONTEND_PORT`.
- Produces: `npm run test:e2e`; unique-user helper; authenticated nested-chapter seeding helper; isolated server lifecycle.

- [ ] **Step 1: Write a failing Playwright smoke test for the server lifecycle**

Assert `/login` loads, Django's CSRF endpoint responds through the Next.js proxy, and the configured SQLite path is not `backend/db.sqlite3`.

- [ ] **Step 2: Run the smoke test and verify the harness is incomplete**

Run: `cd frontend && npm run test:e2e -- e2e/smoke.spec.ts`

Expected: FAIL before web-server commands and configuration are complete.

- [ ] **Step 3: Implement isolated web-server scripts and Playwright configuration**

The backend script removes only its explicit temporary E2E database, migrates it, then `exec`s Django. The frontend script exports the matching backend origin and `exec`s Next.js. Playwright reuses neither server in CI and records traces only on first retry.

- [ ] **Step 4: Implement reusable test helpers**

Provide exact helpers for unique credentials, CSRF bootstrap, UI login, and authenticated JSON chapter creation with one MCQ, one MRQ, and one true/false question.

- [ ] **Step 5: Verify the smoke test and process cleanup**

Run: `cd frontend && npm run test:e2e -- e2e/smoke.spec.ts`

Expected: PASS and no remaining listeners on the E2E ports.

- [ ] **Step 6: Commit only isolatable Task 3 files**

Commit message: `test: add isolated Playwright harness`

### Task 4: Authentication and Upload Form Feedback

**Files:**
- Modify: `frontend/src/components/auth/LoginForm.tsx`
- Modify: `frontend/src/app/(protected)/upload/page.tsx`
- Modify: `frontend/src/services/chapters.ts`
- Modify: `frontend/src/lib/types.ts`
- Test: `frontend/e2e/forms.spec.ts`

**Interfaces:**
- Consumes: React Hook Form field errors and react-dropzone `inputRef`.
- Produces: visible required-field messages; `CreateChaptersAndQuestionsParams.description?: string`; reselectable removed files; `Chapter.question_count?: number`.

- [ ] **Step 1: Write failing form tests using the Task 3 Playwright harness**

Add assertions for empty auth submissions, upload validation clearing, question count selection, removal, and same-file reselection.

- [ ] **Step 2: Run the focused Playwright test and verify failures**

Run: `cd frontend && npx playwright test e2e/forms.spec.ts --project=chromium`

Expected: FAIL on missing field feedback and stale/reselection behavior.

- [ ] **Step 3: Implement field feedback and upload state fixes**

Render per-field auth errors with accessible associations. Clear upload errors when the relevant value changes, clear the native file input on removal, append the optional description to multipart form data, and use `question_count` in chapter UI types.

- [ ] **Step 4: Re-run focused tests and static checks**

Run: `cd frontend && npx playwright test e2e/forms.spec.ts --project=chromium`

Run: `cd frontend && npm run lint`

Expected: PASS.

- [ ] **Step 5: Commit only isolatable Task 4 files**

Commit message: `fix: make auth and upload feedback actionable`

### Task 5: Honest Frontend Loading and Error States

**Files:**
- Create: `frontend/src/components/ErrorState.tsx`
- Modify: `frontend/src/services/chapters.ts`
- Modify: `frontend/src/services/attempts.ts`
- Modify: `frontend/src/app/(protected)/dashboard/page.tsx`
- Modify: `frontend/src/app/(protected)/chapters/page.tsx`
- Modify: `frontend/src/app/(protected)/quiz/page.tsx`
- Modify: `frontend/src/app/(protected)/attempts/page.tsx`
- Modify: `frontend/src/components/questions/QuizComponent.tsx`
- Test: `frontend/e2e/error-states.spec.ts`

**Interfaces:**
- Consumes: thrown Axios/service failures.
- Produces: `ErrorState({ message, onRetry? })`; explicit retry functions per page; visible quiz submission/detail errors.

- [ ] **Step 1: Write failing API-failure Playwright tests**

Intercept chapter, attempt, user-info, and attempt-submission requests individually. Assert a visible error replaces the empty-state copy and that retry reissues the request.

- [ ] **Step 2: Run focused tests and verify they fail**

Run: `cd frontend && npx playwright test e2e/error-states.spec.ts --project=chromium`

Expected: FAIL because services currently swallow selected failures and pages lack retry states.

- [ ] **Step 3: Implement honest service and page error handling**

Allow services to throw, add a focused reusable error component, and give each page a stable load/retry function. Catch quiz start, submission, and attempt-detail failures while restoring controls.

- [ ] **Step 4: Verify focused and static tests**

Run: `cd frontend && npx playwright test e2e/error-states.spec.ts --project=chromium`

Run: `cd frontend && npm run lint`

Run: `cd frontend && npm run build`

Expected: PASS.

- [ ] **Step 5: Commit only Task 5 files**

Commit message: `fix: distinguish empty and failed frontend states`

### Task 6: Complete User-Journey Playwright Coverage

**Files:**
- Create: `frontend/e2e/auth.spec.ts`
- Create: `frontend/e2e/learning-flow.spec.ts`
- Create: `frontend/e2e/upload.spec.ts`
- Modify: `frontend/e2e/support/fixtures.ts`
- Modify: frontend components only when a new failing test exposes a root-cause defect.

**Interfaces:**
- Consumes: Task 3 helpers and real Django endpoints; Playwright route interception only for successful Gemini-boundary upload.
- Produces: deterministic coverage of every user action named in the approved design.

- [ ] **Step 1: Write end-to-end authentication tests**

Cover signup, invalid credentials, successful login, public/protected redirects, password visibility, and logout.

- [ ] **Step 2: Write end-to-end learning-flow tests**

Cover dashboard counts/links, chapter search/category filters, browse pagination, MCQ replacement, MRQ toggling, true/false selection, submission, correctness review, attempt search/sort/detail pagination, delete cancellation, confirmed soft deletion, and preserved attempt history.

- [ ] **Step 3: Write end-to-end upload tests**

Cover non-PDF rejection, malformed PDF response, same-name reselection, all question-count options, user description in multipart data, loading state, mocked successful response, and reset state.

- [ ] **Step 4: Run the complete Playwright suite and fix only reproduced root causes**

Run: `cd frontend && npm run test:e2e`

Expected: all Chromium tests pass without Gemini network calls.

- [ ] **Step 5: Commit only Task 6 files and any directly required fixes**

Commit message: `test: cover complete learning journey`

### Task 7: Dependency and Static-Tool Remediation

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json`
- Modify: `frontend/eslint.config.mjs` only if required by the supported ESLint command.

**Interfaces:**
- Consumes: npm advisory output.
- Produces: direct `eslint .` script and the smallest compatible dependency versions that remove reachable advisories.

- [ ] **Step 1: Record the pre-change audit and proposed dependency resolution**

Run: `cd frontend && npm audit`

Run: `cd frontend && npm audit fix --dry-run`

Expected: current one-critical/five-high baseline and a concrete version resolution.

- [ ] **Step 2: Replace deprecated lint command and apply minimal dependency upgrades**

Change `lint` to `eslint .`. Apply non-major fixes first; use a major Next.js upgrade only if no supported current-major release clears the advisory and the build/tests demonstrate compatibility.

- [ ] **Step 3: Verify dependency changes**

Run: `cd frontend && npm run lint`

Run: `cd frontend && npm run build`

Run: `cd frontend && npm run test:e2e`

Run: `cd frontend && npm audit`

Expected: checks pass and no unresolved reachable critical/high advisory, or an explicitly documented framework-blocked exception.

- [ ] **Step 4: Commit only Task 7 files**

Commit message: `chore: remediate frontend dependency audit`

### Task 8: Final Verification and QA Reference

**Files:**
- Create: `docs/QA.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: verified commands and observed browser/API behavior.
- Produces: click-by-click UI reference, endpoint/Django implementation reference, and reproducible verification record.

- [ ] **Step 1: Run the complete local verification suite**

Run: `make test-all`

Run: `backend/venv/bin/pip check`

Run: `git diff --check`

Expected: all Django, migration, frontend lint/build, Playwright, dependency, and whitespace checks pass except any explicitly documented residual advisory.

- [ ] **Step 2: Run the local app smoke check once more**

Run: `make local-check`

Expected: both services start on configured test ports, proxy requests succeed, and processes shut down cleanly.

- [ ] **Step 3: Write `docs/QA.md` from verified behavior**

Document every page and click, request side effects, validation/error state, all versioned endpoints, permissions, serializers, generic views/APIViews, ORM/queryset use, transactions, scoring, throttling, CSRF/JWT behavior, constraints, and soft deletion.

- [ ] **Step 4: Update README links and final local-run summary**

Link the QA reference and put the shortest working local commands near the top of local-development documentation.

- [ ] **Step 5: Commit Task 8 documentation**

Commit message: `docs: add complete QA and endpoint reference`

- [ ] **Step 6: Invoke verification-before-completion and report evidence**

Include branch name, commit list, exact test counts/results, dependency audit result, known environment requirements, and links to `README.md` and `docs/QA.md`.
