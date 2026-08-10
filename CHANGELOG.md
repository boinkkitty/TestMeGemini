# Changelog

All notable changes to this project are documented in this file.

## Unreleased

### Added

- Versioned `/api/v1/` routes for authentication, users, chapters, chapter
  generation, questions, and attempts.
- Database constraints, indexes, migration backfills, and immutable attempt
  question/choice snapshots.
- Environment-driven production security, database, upload, timeout, cookie,
  CORS, CSRF, and throttle settings.
- Regression coverage for authentication, authorization, atomic writes,
  scoring, migrations, answer secrecy, query counts, and upload validation.

### Changed

- Enforced CSRF protection for cookie-authenticated unsafe requests and public
  authentication actions.
- Made attempt submission ownership-safe, transactional, server-scored, and
  bulk-write optimized.
- Optimized chapter, question, and attempt reads with bounded limits,
  `select_related`, prefetching, and annotations.
- Replaced chapter hard deletion with soft deletion so quiz history remains
  intact.
- Separated safe quiz serializers from correctness-bearing review serializers.
- Hardened PDF extraction and Gemini generation with validation, size limits,
  throttling, timeouts, and client-safe failures.
- Updated the frontend to use the versioned API, CSRF bootstrap, immutable
  attempt review data, and consistent soft-delete behavior.

### Security

- Removed permissive production defaults and required explicit secrets, hosts,
  CORS origins, and CSRF origins outside development.
- Added case-insensitive email uniqueness and Django password validation.
- Prevented cross-user chapter attempts, cross-chapter questions, invalid
  choice bindings, client-controlled scores, and pre-submission answer leakage.
