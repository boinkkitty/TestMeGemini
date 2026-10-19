# Async Generation, OpenAPI, and Backend API Guide Design

## Intent

Make TestMeGemini's API explicit, interview-ready, and resilient to slow PDF
and Gemini work. The browser must no longer wait for a generation request to
finish, and its API calls must stay aligned with the Django contract. The
repository will also contain an accurate explanation of every supported user
action, including the ORM work that prevents avoidable queries.

## Scope

- Publish an OpenAPI 3 contract and interactive Swagger UI/ReDoc for canonical
  `/api/v1/` endpoints.
- Replace synchronous PDF-to-chapter generation with a Celery/Redis-backed job
  API.
- Update the upload client and end-to-end coverage for the asynchronous
  contract.
- Remove only code shown to be dead by routes, imports, frontend callers, and
  tests.
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

### Asynchronous chapter generation

The browser sends the existing multipart fields (`files`, `title`, `category`,
optional `description`, and `question_count`) to:

`POST /api/v1/chapter-generations/`

The view validates uploads and metadata synchronously, creates a
`ChapterGeneration` row owned by the authenticated user, stores the uploaded
files in Django-managed storage, queues a Celery task after transaction commit,
and returns `202 Accepted` with a representation such as:

```json
{
  "id": "uuid",
  "status": "queued",
  "status_url": "/api/v1/chapter-generations/uuid/"
}
```

`GET /api/v1/chapter-generations/{id}/` is owner-scoped and returns the
current state: `queued`, `processing`, `succeeded`, or `failed`. A successful
job includes `chapter_id` and generated `question_ids`; a failed job provides
a sanitized user-safe message. The worker records operational details in logs
but never exposes provider exceptions, file contents, or tracebacks.

The Celery task transitions the job to `processing`, extracts text, calls
Gemini, and persists the chapter/questions using the existing transactional
creation service. It records success or failure atomically. Upload validation
stays in the request path to reject invalid or oversized files immediately.
Files are removed after completion/failure; the generation record remains as a
durable audit/status result. Jobs are idempotent at the task level: terminal
jobs are not processed again.

Redis is the Celery broker and result backend. Docker Compose gains Redis and a
worker service; local development documentation provides the equivalent worker
command. Production settings are environment-configured and must not default
to an external broker.

### Frontend contract

The chapter service will expose a submit function that returns a generation
job, plus a status lookup function. The upload page submits once, then polls
the returned status URL at a bounded interval while the page is mounted. It
shows queued/processing copy, disables duplicate submissions, clears the form
only after success, refreshes chapter data as needed, and displays the
sanitized failure message without retrying automatically. Unmounting cancels
the polling timer. Existing CSRF and cookie behavior remains in Axios.

### Data and ownership

`ChapterGeneration` contains a UUID primary key, user foreign key, source
metadata, request parameters, job state, user-safe error text, optional result
chapter foreign key, timestamps, and uploaded-file references. Its indexes
support an owner's recent-job/status lookups. The status view filters by user,
so other users receive `404`, consistent with protected resources elsewhere.

The existing `create_chapter_and_questions_atomic` remains the single write
path for the completed chapter, questions, and choices. The worker never holds
a database transaction open while parsing a PDF or waiting for Gemini; the
short final persistence transaction is atomic.

### Dead-code policy

The dedicated generation endpoint is the only frontend caller. The duplicate
file-upload branch in `ChapterListCreateAPIView.create` is removed, leaving
that endpoint responsible solely for JSON chapter creation. Dead imports,
obsolete synchronous generation glue, and matching obsolete tests are removed
only after repository-wide reference checks. Compatibility routes and code
used by a supported frontend flow are retained.

## User-flow guide (`backend_apis.md`)

The guide will map each action to its canonical endpoint(s): session bootstrap,
registration, login/logout/refresh, profile read/update, chapter list/create/
read/update/delete, async PDF generation submission/status, question loading,
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

- Invalid form fields/files fail synchronously with `400`; authentication,
  CSRF, and throttles retain their current behavior.
- Queue submission failure marks the new job failed and returns a safe server
  error rather than leaving a job indefinitely queued.
- Provider/PDF failures transition a queued/processing job to `failed`; status
  polling remains readable.
- Worker retries are limited to transient infrastructure failures. Gemini's
  existing bounded model fallback/retry policy remains inside the AI utility.
- Polling stops on terminal status, unmount, or a client-side polling failure.

## Testing and verification

- Test the schema endpoint and verify canonical paths, security metadata, and
  multipart/status response documentation.
- Test successful queued submission, ownership isolation, validation failures,
  task success/failure transitions, terminal-task idempotency, file cleanup,
  and that persistence remains atomic.
- Test the frontend service and upload state transitions with mocked job
  responses; update Playwright route fixtures from immediate success to
  `202` plus status polling.
- Run Django tests/migration checks/system checks, frontend lint/build, and
  targeted browser tests. Run the full project suite when the environment can
  provide its dependencies and report any pre-existing failures separately.

## Non-goals

- No streaming/SSE/WebSocket transport; polling is sufficient for a single
  long-running upload flow and keeps the operational footprint modest.
- No conversion of bounded CRUD/attempt endpoints to async Django views.
- No deletion of compatibility URLs without a separate deprecation decision.
