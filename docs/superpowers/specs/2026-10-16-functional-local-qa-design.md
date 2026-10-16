# Functional Local QA Design

## Goal

Make TestMeGemini reliably runnable on a developer machine, repair the functional gaps found during full-stack QA, and add deterministic automated coverage for the browser journeys that matter.

Success means a developer can install dependencies, start Django and Next.js without conflicting with unrelated local services, run backend and frontend checks, and execute Playwright without calling Gemini or modifying a personal development database.

## Existing System

The application is a Next.js App Router frontend backed by Django REST Framework. Browser requests remain same-origin through a Next.js catch-all API route, which forwards `/api/v1/*` to Django. Django authenticates with SimpleJWT access and refresh tokens stored in HTTP-only cookies and enforces CSRF protection on unsafe cookie-authenticated requests.

The domain is split into Django apps for users, chapters, questions, and attempts. PDF extraction and Gemini generation live behind the chapter generation service. Attempts are scored and persisted atomically, with snapshots preserving historical review data after chapter deletion or question changes.

The existing branch already has 40 passing Django tests, a passing Next.js build and lint check, and working browser flows for authentication, navigation, chapter browsing, quizzes, scoring, attempt review, filtering, and soft deletion.

## Local Runtime

Local execution is the primary requirement. The repository will expose explicit commands for:

- installing backend and frontend dependencies;
- applying Django migrations;
- starting Django and Next.js together with configurable ports;
- running backend, frontend, and Playwright checks;
- running the complete verification suite.

The local runner will default Django to port `8001` and Next.js to port `3000`. Port `8001` avoids the common collision already observed with an unrelated service on port `8000`. The frontend process will receive `API_URL=http://127.0.0.1:8001`, while callers may override both ports through task-specific environment variables.

The Playwright runner will use a separate SQLite database under a temporary directory. It will migrate that database before starting Django and will not reuse or alter `backend/db.sqlite3`. Gemini calls will never be made by the automated browser suite.

## Functional Repairs

### Upload contract and feedback

The optional description entered on the upload page will be sent with the multipart generation request. When non-empty, the user's description will become the chapter description. When blank, the generated Gemini description remains the fallback.

Upload validation errors will clear as the relevant title, category, or file input is corrected. File removal will reset the underlying file input so selecting the same filename again works. The page will retain server-provided validation messages for malformed PDFs and generation failures.

### Authentication forms

Login and signup will display field-level required validation instead of silently ignoring empty submission. Email inputs will retain browser email validation, and API messages such as invalid credentials or duplicate email will remain visible at form level.

### Chapter counts and dashboard totals

The chapter list queryset will annotate the number of questions, and the list serializer will expose it as `question_count`. Frontend chapter cards and quiz selection cards will use that value instead of showing an em dash.

Dashboard total chapters and total attempts will render numeric `0` for an empty account. Average and best score may retain an em dash when no scored attempt exists because those metrics are genuinely unavailable rather than zero.

### Honest error states

Frontend data services will stop converting request failures into empty arrays. Pages will catch failures explicitly and show a retryable error state, keeping genuine empty states distinct from backend or network failures. Quiz selection, attempt detail, and attempt submission will surface errors and restore usable controls rather than leaving an unhandled rejection or misleading content.

## Automated Testing

### Django

Existing tests remain the foundation. New tests will prove:

- chapter generation honors a supplied description;
- generated description remains the fallback when the supplied value is blank;
- chapter list responses include bounded-query `question_count` values;
- existing ownership, answer secrecy, atomicity, upload validation, authentication, and scoring behavior remains intact.

The backend suite will run with `python manage.py test`, followed by migration drift and Django system checks.

### Frontend static checks

The frontend suite will run ESLint directly, TypeScript/build validation through `next build`, and `npm audit`. The deprecated `next lint` script will be replaced with the ESLint CLI without changing lint policy.

### Playwright

Playwright will start isolated Django and Next.js web servers and cover:

1. Signup, duplicate/invalid registration feedback, login failure, login success, logout, authenticated public-route redirects, and unauthenticated protected-route redirects.
2. Empty dashboard, chapters, quiz, and attempts states.
3. Deterministic chapter creation through the authenticated JSON chapter endpoint, avoiding Gemini while exercising the real Django ORM and serializers.
4. Dashboard counts and links, chapter search/category filtering, chapter question pagination, and quiz navigation.
5. MCQ replacement selection, MRQ toggle selection, true/false selection, attempt submission, score display, answer review, attempt filtering/sorting, and detail pagination.
6. Upload required fields, invalid file rejection, same-file reselection after removal, question-count selection, malformed PDF server feedback, and a mocked successful generation response at the external generation boundary.
7. Delete dialog cancellation, confirmed soft deletion, removal from chapter/quiz lists, and preservation of attempt history.

Each test will create a unique user. Tests will use only the isolated E2E database, and browser storage will be isolated per Playwright context.

## Dependency Security

Frontend dependencies will be upgraded to the smallest fixed compatible releases available. Major upgrades will be accepted only when no supported release in the current major resolves an advisory. After each dependency change, lint, build, Playwright, and `npm audit` will be rerun. Any advisory that cannot be removed without an unrelated framework migration will be documented with its reachable impact and follow-up recommendation rather than hidden.

Backend dependencies will be checked for internal consistency with `pip check`. No broad version upgrade is included unless the existing requirements are incompatible or a directly relevant vulnerability is identified by an available audit tool.

## Documentation and Final Report

The README will document the local startup path, port overrides, environment requirements, test commands, and the fact that Playwright does not call Gemini.

The final QA report will contain:

- the exact verification commands and results;
- every page, clickable control, and resulting user-visible state;
- all `/api/v1/` endpoints, request and response purpose, permissions, validation, and data effects;
- the Django facilities used by each endpoint, including generic views, APIView, serializers, ORM querysets, transactions, authentication, CSRF, throttling, migrations, constraints, and soft deletion;
- external dependencies or behaviors that remain environment-dependent.

## Out of Scope

- Changing the visual design or navigation structure.
- Calling the live Gemini API from automated tests.
- Replacing cookie JWT authentication or the Next.js same-origin proxy.
- Adding Celery or asynchronous generation.
- Refactoring unrelated Django apps or frontend components.
