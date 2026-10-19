# OpenAPI and Backend Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Publish an accurate OpenAPI contract for the versioned Django API, remove the duplicate generation route implementation, verify the frontend contract, and provide a local interview guide.

**Architecture:** drf-spectacular derives the schema from DRF serializers and explicit view annotations, while URL configuration exposes only the canonical v1 contract through schema, Swagger UI, and ReDoc views. The dedicated generation endpoint remains synchronous; the redundant file-upload branch on chapter CRUD is removed. The user-only guide describes the implemented request path and ORM behavior without becoming a committed project artifact.

**Tech Stack:** Django 5.2, Django REST Framework 3.16, drf-spectacular, Next.js/TypeScript, Playwright.

**Spec:** docs/superpowers/specs/2026-10-19-async-openapi-design.md

## Global Constraints

- Do not add Celery, Redis, queues, jobs, polling, WebSockets, or async Django views.
- The PDF-to-question endpoint remains POST /api/v1/chapter-generations/ and returns its existing synchronous 201 result.
- Public OpenAPI documentation includes canonical /api/v1/ routes only; legacy /api/ routes remain functional but excluded.
- Preserve cookie JWT and CSRF behavior, authorization, throttles, answer secrecy, and current client-facing errors.
- backend_apis.md is generated for the user locally and must stay untracked/uncommitted.
- Delete code only after a repository-wide caller/reference check proves it unused.

## Review Focus

- Public question payloads must never expose correct answers.
- Multipart generation must document files, title, category, description, and question_count.
- Public schema UI must not weaken endpoint authentication or CSRF rules.
- Removing the duplicate upload branch must retain JSON chapter creation.
- Frontend upload success must still expect chapter_id and question_ids.

---

### Task 1: Install and configure the canonical OpenAPI surface

**Files:**
- Modify: backend/requirements.txt
- Modify: backend/api/settings.py
- Modify: backend/api/urls.py
- Modify: backend/api/tests.py

**Interfaces:**
- Produces GET /api/schema/, GET /api/schema/swagger-ui/, and GET /api/schema/redoc/.
- Produces an OpenAPI document scoped to /api/v1/ with cookie-JWT/CSRF usage documented.

- [ ] **Step 1: Write failing schema-route tests**

Assert anonymous GET /api/schema/ returns a document containing /api/v1/chapters/, /api/v1/chapter-generations/, and /api/v1/attempts/, but not /api/chapters/. Assert Swagger UI and ReDoc return 200.

- [ ] **Step 2: Run the tests to verify they fail**

Run: cd backend && venv/bin/python manage.py test api.tests -v 2

Expected: FAIL because schema routes do not exist.

- [ ] **Step 3: Configure drf-spectacular**

Add the dependency and app, set REST framework DEFAULT_SCHEMA_CLASS to drf_spectacular.openapi.AutoSchema, define project metadata and canonical-route inclusion in SPECTACULAR_SETTINGS.

- [ ] **Step 4: Mount schema, Swagger UI, and ReDoc routes**

Use SpectacularAPIView, SpectacularSwaggerView, and SpectacularRedocView. Keep admin and compatibility URL mounts unchanged.

- [ ] **Step 5: Run API tests to verify they pass**

Run: cd backend && venv/bin/python manage.py test api.tests -v 2

Expected: PASS.

- [ ] **Step 6: Commit**

Run: git add backend/requirements.txt backend/api/settings.py backend/api/urls.py backend/api/tests.py && git commit -m "feat: publish OpenAPI schema and UI"

### Task 2: Make custom and multipart endpoint documentation accurate

**Files:**
- Modify: backend/users/views.py
- Modify: backend/chapters/views.py
- Modify: backend/attempts/views.py
- Modify: backend/api/tests.py

**Interfaces:**
- Consumes: schema endpoints from Task 1.
- Produces documented request/response schemas for authentication, generation, attempts, and standard chapter operations.

- [ ] **Step 1: Write failing schema-content tests**

Assert POST /api/v1/chapter-generations/ has multipart/form-data fields files, title, category, optional description, and question_count; assert its 201 response has chapter_id and question_ids. Assert paths for login, refresh, attempts, chapter questions, and profile are present.

- [ ] **Step 2: Run focused schema-content tests to verify failure**

Run: cd backend && venv/bin/python manage.py test api.tests.OpenAPISchemaTests -v 2

Expected: FAIL because custom APIViews lack sufficient schema metadata.

- [ ] **Step 3: Add explicit schema annotations and documentation serializers**

Use extend_schema, inline serializers, and response definitions. Describe cookie JWT/CSRF in schema settings and keep public question serializers answer-safe. Do not alter runtime behavior solely for docs.

- [ ] **Step 4: Run schema and affected app tests**

Run: cd backend && venv/bin/python manage.py test users chapters attempts api -v 1

Expected: PASS.

- [ ] **Step 5: Commit**

Run: git add backend/users/views.py backend/chapters/views.py backend/attempts/views.py backend/api/tests.py && git commit -m "docs: describe versioned API operations"

### Task 3: Remove duplicate upload implementation safely

**Files:**
- Modify: backend/chapters/views.py
- Modify: backend/chapters/tests.py

**Interfaces:**
- Consumes: dedicated POST /api/v1/chapter-generations/.
- Produces: POST /api/v1/chapters/ accepts JSON nested creation only; generation stays dedicated.

- [ ] **Step 1: Write a failing CRUD test**

POST a valid nested JSON chapter to /api/v1/chapters/, receive answer-safe 201 data, and assert generate_chapter_from_files is not called.

- [ ] **Step 2: Run targeted test to verify failure**

Run: cd backend && venv/bin/python manage.py test chapters.tests.ChapterQuestionAPITests.test_chapter_create_uses_json_only_path -v 2

Expected: FAIL until the explicit JSON-only creation path exists.

- [ ] **Step 3: Remove the request.FILES branch and unused import**

Keep ChapterGenerationAPIView and its route. Before deletion, verify repository-wide that no caller posts multipart data to /api/v1/chapters/.

- [ ] **Step 4: Run chapter tests**

Run: cd backend && venv/bin/python manage.py test chapters -v 1

Expected: PASS.

- [ ] **Step 5: Commit**

Run: git add backend/chapters/views.py backend/chapters/tests.py && git commit -m "refactor: keep generation on dedicated endpoint"

### Task 4: Verify frontend contract and generate the local guide

**Files:**
- Modify only if drift is proven: frontend/src/services/chapters.ts, frontend/src/app/(protected)/upload/page.tsx, frontend/e2e/upload.spec.ts, frontend/e2e/forms.spec.ts
- Create, do not commit: backend_apis.md

**Interfaces:**
- Consumes: 201 {chapter_id: integer, question_ids: integer[]} generation response.
- Produces: frontend multipart submission matching the canonical endpoint and a local interview guide.

- [ ] **Step 1: Add a failing frontend test only if inspection finds contract drift**

The test must prove the actual mismatch. Do not make a no-op frontend change if service and Playwright coverage already match the backend.

- [ ] **Step 2: Run the targeted frontend test**

Expected: FAIL for a proven mismatch; otherwise record no production frontend change is required.

- [ ] **Step 3: Make the smallest required frontend correction**

Preserve endpoint, 201 response, CSRF Axios behavior, immediate-success state, description, question_count, and repeated files. Do not add polling.

- [ ] **Step 4: Generate backend_apis.md without staging it**

Explain every canonical user action, endpoint, serializer/service/model sequence, auth/CSRF, validation, transactions, ownership filtering, and exact select_related, prefetch_related, Prefetch, and Count rationale. Label async PDF/Gemini work as future-only.

- [ ] **Step 5: Run frontend checks**

Run: cd frontend && npm run lint && npx playwright test e2e/upload.spec.ts e2e/forms.spec.ts

Expected: PASS.

- [ ] **Step 6: Confirm the guide is untracked**

Run: git status --short backend_apis.md

Expected: ?? backend_apis.md

### Task 5: Complete verification and handoff

**Files:** Verify all changed backend/frontend files and untracked backend_apis.md.

- [ ] **Step 1: Run backend verification**

Run: make test-backend

Expected: tests, migration dry-run, and system check pass.

- [ ] **Step 2: Run frontend verification**

Run: make test-frontend

Expected: lint and production build pass.

- [ ] **Step 3: Inspect final diff and guide state**

Run: git diff main...HEAD --check && git status --short

Expected: no whitespace errors and backend_apis.md remains the only intended untracked deliverable.

- [ ] **Step 4: Report schema URLs, cleanup, frontend status, and future async recommendation**
