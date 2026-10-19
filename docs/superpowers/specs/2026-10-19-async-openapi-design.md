# OpenAPI and Backend API Guide Design

## Intent

Make TestMeGemini's API explicit and interview-ready while keeping the browser
and Django contract aligned. The repository will contain accurate explanations
of every supported user action, including the ORM work that prevents avoidable
queries and an honest assessment of which work should become asynchronous in a
future phase.

## Scope

- Publish an OpenAPI 3 contract and interactive Swagger UI/ReDoc for canonical
  `/api/v1/` endpoints.
- Document the existing synchronous PDF-to-chapter generation contract and its
  asynchronous migration recommendation; do not add a queue or worker.
- Verify the frontend service and upload page use the documented canonical
  backend endpoints, correcting contract drift if found.
- Remove only code shown to be dead by routes, imports, frontend callers, and tests.
- Add `backend_apis.md` as an interview guide for user flows and database
  loading strategies.

The legacy unversioned routes remain available for compatibility but are not
advertised in the schema. This change does not make ordinary CRUD or quiz
attempt endpoints asynchronous: those requests perform bounded database work
and benefit from a synchronous request/response interface.

## Architecture

### OpenAPI documentation

`drf-spectacular` will generate an OpenAPI 3.0.3 document from the DRF views
and serializers. Schema, Swagger UI, and ReDoc will be served under
`/api/schema/`, `/api/schema/swagger-ui/`, and `/api/schema/redoc/`.

The public contract will describe cookie-JWT authentication and the CSRF
bootstrap requirement. Each canonical route will have a summary, tags,
request/response serializers, and common `400`, `401`, `403`, `404`, and
`429` responses where applicable. Multipart generation submission and job
status responses require explicit annotations because their payloads are not
plain model serializers. Canonical `/api/v1/` routes are the only routes
included in the generated API documentation; the Django admin and legacy
mounts are excluded.

### Current chapter generation and async recommendation

The browser sends the multipart fields (`files`, `title`, `category`, optional
`description`, and `question_count`) to:

`POST /api/v1/chapter-generations/`

The view validates uploads and metadata, extracts PDF text, calls Gemini, and
persists the chapter/questions before returning `201 Created` with
`chapter_id` and `question_ids`. It uses the existing transactional persistence
service. The OpenAPI contract and frontend types will represent that actual
synchronous response.

This endpoint is the sole async candidate identified for a future phase: PDF
extraction and remote Gemini calls can make one HTTP request slow. A future
Celery + Redis design would validate and store an upload, return `202 Accepted`
with a job URL, and let the browser poll a status endpoint. It is deliberately
not implemented here: no Celery/Redis dependencies, job models, worker
services, status endpoint, or `202` contract will be added.

### Frontend contract

The chapter service submits the existing multipart request and receives the
current synchronous creation result. The upload page disables duplicate
submissions while the request is active, clears the form only after success,
and displays the backend's safe validation/provider failure message. Existing
CSRF and cookie behavior remains in Axios. This phase will correct only proven
frontend/backend contract drift, not introduce polling or job UI state.

### Dead-code policy

The dedicated generation endpoint is the only frontend caller. The duplicate
file-upload branch in `ChapterListCreateAPIView.create` is removed, leaving
that endpoint responsible solely for JSON chapter creation. Dead imports and
matching obsolete tests are removed only after repository-wide reference
checks. Compatibility routes and code used by a supported frontend flow are
retained.

## User-flow guide (`backend_apis.md`)

The guide will map each action to its canonical endpoint(s): session bootstrap,
registration, login/logout/refresh, profile read/update, chapter list/create/
read/update/delete, synchronous PDF generation, question loading,
attempt submission/listing, and attempt review. For each it will explain
authentication, CSRF, serializers, services, models, success/error behavior,
and query shape.

In particular it will explain:

- `select_related` for single-valued chapter/user foreign keys on attempt
  history/detail requests;
- `prefetch_related` and `Prefetch` for question choices and nested question
  attempts, avoiding a query per serialized child;
- `Count` annotations for list metadata without calling `.count()` once per
  row;
- ownership-scoped querysets and soft deletion;
- `transaction.atomic`, `select_for_update`, `bulk_create`, immutable attempt
  snapshots, and their correctness/performance roles.

## Error handling and lifecycle

- Invalid form fields/files fail with `400`; authentication, CSRF, and
  throttles retain their current behavior.
- PDF/provider failures return the existing safe validation error response.
  Gemini's bounded model fallback/retry policy remains inside the AI utility.
- The guide will explain why this user-visible wait is the strongest future
  candidate for an asynchronous job API and what would change when adopted.

## Testing and verification

- Test the schema endpoint and verify canonical paths, security metadata, and
  multipart generation request/success-response documentation.
- Test the documented synchronous generation response, validation failures,
  and atomic persistence.
- Test frontend service/upload behavior only where a contract correction is
  needed; retain immediate-success Playwright fixtures.
- Run Django tests/migration checks/system checks, frontend lint/build, and
  targeted browser tests. Run the full project suite when the environment can
  provide its dependencies and report any pre-existing failures separately.

## Non-goals

- No Celery, Redis, worker, job model, polling, streaming, SSE, or WebSocket
  work in this phase.
- No conversion of any endpoint to an async Django view in this phase.
- No deletion of compatibility URLs without a separate deprecation decision.
