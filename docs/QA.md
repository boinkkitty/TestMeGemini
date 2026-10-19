# Functional QA and behavior reference

Verified on the `test-qa` branch on 17 October 2026. The browser suite uses Chromium, real Django endpoints, a disposable SQLite database, and a mocked response only at the external Gemini generation boundary.

## Run locally

From the repository root:

```bash
make backend-install
make frontend-install
cp backend/.env.example backend/.env
make local-run
```

Open `http://127.0.0.1:3000`. Django defaults to `127.0.0.1:8001`, avoiding the commonly occupied port 8000. Override either port with `TESTME_BACKEND_PORT` and `TESTME_FRONTEND_PORT`. General use works without Gemini; PDF generation requires `GEMINI_API_KEY`.

Useful checks:

```bash
make local-check
make test-backend
make test-frontend
make test-e2e
make test-all
```

## Every page, click, and user action

### Authentication and route guards

- Opening a protected route without a `refresh_token` cookie redirects to `/login` in the Next.js proxy.
- **Sign up** opens `/signup`. Username, email, and password have visible, accessible required-field messages. The password **Show/Hide** button changes the input type. **Create account** first gets a CSRF cookie, then posts the form to `POST /api/v1/users/`. Success opens `/login`; Django validation errors remain visible.
- **Log in** validates email and password locally, gets the CSRF cookie, and posts to `POST /api/v1/auth/login/`. Invalid credentials display the backend message. Success receives HTTP-only access/refresh cookies and opens `/dashboard`.
- Visiting `/login` or `/signup` with a refresh cookie redirects to `/dashboard`.
- **Log Out** posts to `POST /api/v1/auth/logout/`, blacklists a valid refresh token, clears both JWT cookies, and opens `/login` even if cleanup fails. Protected routes are inaccessible afterward.
- An API 401 causes Axios to call `POST /api/v1/auth/token/refresh/` once and retry the original request. Failed refresh performs best-effort logout and sends the browser to `/login`.

### Sidebar

- The logo and **Dashboard** open `/dashboard`.
- **+ Upload Notes** opens `/upload`.
- **Chapters**, **Quiz**, and **Attempts** open their respective pages.
- The user chip is populated by `GET /api/v1/users/me/`.

### Dashboard

- Loading concurrently requests the user, up to four chapters, attempts from the last seven days, and the latest ten attempts.
- The statistics show numeric zero rather than a placeholder when the account has no data. Average/best score use the seven-day attempt set.
- **+ Upload Notes** opens the upload page; **All chapters →** opens chapters.
- A chapter row's **Browse** opens chapters and **Quiz →** opens quiz.
- **View all →** and a recent-attempt row open attempts.
- Failed dashboard data shows **Unable to load dashboard**. **Retry** repeats all dashboard requests; failure is never rendered as an empty account.

### Upload Notes

- Editing title/category clears stale validation feedback. Question count supports exactly 10, 20, 30, or 50. Description is optional and is sent when nonblank.
- Clicking or dropping on the dropzone accepts PDF files only. Non-PDF input shows **Only PDF files are accepted**. Duplicate filenames are not added twice.
- A file chip's **Remove _filename_** removes it and clears the native file input, so the same file can immediately be selected again.
- **Generate questions** validates title, category, and at least one PDF in that order. It then sends multipart data to `POST /api/v1/chapter-generations/` and shows **Generating…** while disabled.
- A malformed/unreadable PDF displays the backend extraction error. A missing Gemini key clearly requests `GEMINI_API_KEY`. Other safe backend validation errors are surfaced rather than swallowed.
- Success displays confirmation and resets title, category, description, files, and question count (back to 30).

### Chapters

- Initial load calls `GET /api/v1/chapters/`. Failure shows **Unable to load chapters** and **Retry**, not “No chapters yet.”
- **Search title…** filters case-insensitively. **Category** filters to an exact category. No matches are distinguished from an account with no chapters.
- Each card displays the server-provided `question_count`.
- **Browse** calls `GET /api/v1/chapters/{id}/questions/`. **Next →** and **← Previous** paginate questions; **← Back** returns to cards. A request failure has its own retry state.
- **Quiz →** opens the quiz chapter picker.
- The trash button opens a confirmation dialog. **Cancel** changes nothing. **Delete** calls `DELETE /api/v1/chapters/{id}/`, refreshes the list, and hides the soft-deleted chapter. Previous attempts remain available.

### Quiz

- Initial load calls `GET /api/v1/chapters/`; empty and failed states are distinct and failures are retryable.
- Clicking a chapter fetches its questions and starts the quiz. The count comes from `question_count`. Start failure restores the picker and offers retry.
- MCQ and true/false clicks replace the previous selection. MRQ clicks toggle each selection independently. **Next →** and **← Previous** retain answers.
- On the final question, **Submit** posts the ordered question IDs and selected choice IDs to `POST /api/v1/attempts/`. The button becomes **Submitting…** and cannot double-submit.
- Submission success loads `GET /api/v1/attempts/{id}/`, then reveals correctness from immutable snapshots, total score, percentage, and answer labels. Correct answers are not present in pre-submit question responses.
- Submission/detail failure displays **Unable to submit quiz. Please try again**, restores **Submit**, and preserves selected answers.

### Attempts

- Initial load calls `GET /api/v1/attempts/`. Failure shows a retryable error rather than “No attempts yet.”
- **Search title…** and **Category** filter locally. **Sort By** supports latest, oldest, highest score, and lowest score.
- Clicking an attempt calls `GET /api/v1/attempts/{id}/`. Detail failures have a retry state.
- Detail **Next →** / **← Previous** paginate immutable question/choice snapshots, selected choices, correctness, and per-question score. **← Back** returns to the attempt list.
- Attempt review still works after its chapter has been soft-deleted.

## Versioned backend endpoints

All versioned endpoints are under `/api/v1`. Except for CSRF bootstrap, registration, and auth actions, DRF defaults to `IsAuthenticated` with `CookieJWTAuthentication`.

| Method and path | Behavior | Django/DRF implementation |
|---|---|---|
| `GET /auth/csrf/` | Returns 204 and sets the CSRF cookie. | `APIView`, `AllowAny`, `ensure_csrf_cookie`. |
| `POST /users/` | Registers an email-login user; normalizes email, validates Django password rules, hashes password, enforces case-insensitive uniqueness. | `CreateAPIView`, `RegisterUserSerializer`, custom `AbstractUser`/manager, `auth_register` throttle, `csrf_protect`. |
| `GET /users/me/` | Returns id/email/username for the authenticated user. | `RetrieveUpdateAPIView.get_object`, `CustomUserSerializer`, `user_settings` throttle. |
| `PUT/PATCH /users/me/` | Updates safe profile fields with case-insensitive email collision handling. | `RetrieveUpdateAPIView`, serializer validation and `transaction.atomic`. |
| `POST /auth/login/` | Authenticates email/password and sets HTTP-only access and refresh JWT cookies. | `APIView`, `LoginUserSerializer`, Django `authenticate`, SimpleJWT `RefreshToken`, `auth_login` throttle, CSRF. |
| `POST /auth/token/refresh/` | Validates refresh cookie and replaces the access cookie. | `APIView`, SimpleJWT, `auth_refresh` throttle, CSRF. |
| `POST /auth/logout/` | Blacklists refresh token when possible and deletes both JWT cookies. | `APIView`, SimpleJWT blacklist, `auth_logout` throttle, CSRF. |
| `GET /chapters/?limit=N` | Lists only the caller's active chapters, newest first, with annotated `question_count`; limit is positive and capped. | `ListCreateAPIView`, custom queryset manager, `Count`, `ChapterListSerializer`. |
| `POST /chapters/` | Creates a chapter with nested questions/choices from JSON. Legacy multipart uploads route through the same generation service and throttle. | `ListCreateAPIView`, nested `ChapterCreateSerializer`, serializer `transaction.atomic`. |
| `GET /chapters/{id}/` | Returns the caller's active chapter and nested questions without correctness flags. | `RetrieveUpdateDestroyAPIView`, owner-filtered queryset, `prefetch_related`, `ChapterDetailSerializer`. |
| `PUT/PATCH /chapters/{id}/` | Updates the caller's active chapter. | `RetrieveUpdateDestroyAPIView`, `ChapterUpdateSerializer`. |
| `DELETE /chapters/{id}/` | Sets `is_deleted=True`; it does not remove attempt history. | `perform_destroy` soft delete. `ChapterAttempt.chapter` uses `RESTRICT`. |
| `GET /chapters/{id}/questions/?limit=N` | Verifies ownership/active status and returns up to the capped limit in randomized order, without `is_correct`. | `APIView`, `get_object_or_404`, custom question queryset, `prefetch_related`, safe read serializer. |
| `POST /chapter-generations/` | Validates PDFs and count (10/20/30/50), extracts text, calls Gemini, validates exact structured output, and atomically saves chapter/questions/choices. | `APIView`, `chapter_generation` throttle, PDF utility, Pydantic AI schema, service layer, `transaction.atomic`. |
| `GET /attempts/?start_date=&end_date=&limit=` | Lists the caller's attempts with date filters, newest first, score and annotated max score. | `ListCreateAPIView`, filter serializer, timezone-aware bounds, queryset manager, `select_related`, `Count`. |
| `POST /attempts/` | Validates ownership, question order, choice membership and duplicates; locks rows; calculates score; snapshots review data; saves everything atomically. | Input serializers, service layer with `@transaction.atomic`, `select_for_update`, `bulk_create`. |
| `GET /attempts/{id}/` | Returns only the caller's attempt with question attempts and correctness-bearing immutable snapshots. | `RetrieveAPIView`, owner filter, `Prefetch`, detail serializers. |

Legacy `/api/users/`, `/api/chapters/`, and `/api/attempts/` mounts remain for compatibility. New clients should use `/api/v1/`.

## Django behavior and data integrity

- `CustomUser` extends `AbstractUser`, uses email as `USERNAME_FIELD`, and has both field uniqueness and a database `UniqueConstraint(Lower("email"))`.
- `Chapter`, `Question`, `Choice`, `ChapterAttempt`, and `QuestionAttempt` are Django models with ownership/ordering indexes. QuerySet managers centralize active/owned filtering.
- Chapter list counts use an ORM `Count` annotation, avoiding per-card queries. Detail reads use `select_related`/`prefetch_related` to bound query growth.
- Nested question serializers enforce MCQ, MRQ, and true/false choice/correctness rules. Safe read serializers omit `is_correct` before submission.
- Attempt creation is atomic and row-locked. MCQ/TF award 1 for an exact answer. MRQ uses `(correct selected - incorrect selected) / correct choices`, floored at zero.
- Attempt snapshots retain question text, choices, correct flags, selected IDs, and a scoring version. Foreign keys use `RESTRICT` where history must survive.
- PDF generation saves nothing until extraction, Gemini generation, schema checks, and serializer validation all succeed. A supplied description wins; otherwise Gemini's summary is used.
- Gemini configuration is lazy: a missing key does not prevent Django startup, login, browsing, or quizzes; only generation returns a configuration error.
- Unsafe cookie-authenticated requests must pass Django CSRF checks. JWTs are HTTP-only, configurable for Secure/SameSite/domain, and refresh tokens are blacklistable.
- DRF applies anonymous/user defaults plus scoped auth, user-settings, and generation rates from environment variables.

## Verification record

- Django: 44 tests passed; system check clean; no pending migrations.
- Frontend: direct `eslint .` clean; Next.js 16.4.2 production build successful.
- Playwright: 10 Chromium tests passed against isolated local servers/database.
- Local smoke: backend and frontend started on non-default check ports, proxy worked, and both processes stopped cleanly.
- Dependencies: `npm audit --omit=dev` reports zero vulnerabilities. Full audit retains five high findings only in `eslint-config-next -> fast-glob -> micromatch -> braces`; npm has no patched `braces` release and proposes an incompatible Next 14 lint-config downgrade.
