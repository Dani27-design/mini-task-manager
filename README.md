# Mini Task Manager

Mini Task Manager is a small internal tool for creating, updating, soft-deleting, and auditing task changes. The source of truth for the implementation is `docs/prd.md` and `docs/implementation-plan.md`.

## How to Run

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs at `http://127.0.0.1:3000` by default.

Backend environment example:

```bash
cp .env.example .env
```

Available backend scripts:

```bash
npm run typecheck
npm run build
npm run test:unit
npm run test:integration
npm run test:e2e
npm test
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs through Vite. With the default Vite port, open the URL printed in the terminal, usually `http://127.0.0.1:5173`.

Frontend environment example:

```bash
cp .env.example .env
```

Available frontend scripts:

```bash
npm run typecheck
npm run build
npm run test:unit
npm run test:integration
npm run test:e2e
npm test
```

## Architecture

The backend uses Node.js, Express, TypeScript, SQLite, Zod, and UUID. The backend flow is:

```text
Route -> Validation Middleware -> Controller -> Service -> Repository -> SQLite
```

The frontend uses React, TypeScript, Axios, `useState`, and `useEffect`. It calls the backend APIs for actors, tasks, and audit logs, then maps technical values such as `in_progress` and `TASK_UPDATED` into readable UI labels.

Test structure:

- Frontend co-located unit tests: `frontend/src/components/*.test.tsx`
- Frontend integration tests: `frontend/test/integration`
- Frontend e2e-style tests: `frontend/test/e2e`
- Backend co-located unit tests: `backend/src/**/*.test.ts`
- Backend integration tests: `backend/test/integration`
- Backend e2e tests: `backend/test/e2e`

## Assumptions

- Actors are predefined and cannot be created, edited, or deleted from the UI.
- Authentication and authorization are out of scope.
- SQLite is enough for the initial implementation and local development.
- Task status must follow the linear workflow: `to_do -> pending -> in_progress -> done`.
- Deleting a task means setting `deletedAt`; the row is not physically removed.
- A no-op update does not create an audit log because no real state change happened.

## Trade-offs

- Audit logs are protected through the service layer, and there are no API endpoints to update or delete audit logs. This is simple and fits the scope, but it is weaker than database-level protection such as triggers or restricted permissions.
- Frontend e2e coverage uses Vitest/jsdom with mocked API boundaries instead of Playwright/browser tests. This keeps the project lightweight, but it does not validate a real browser.
- SQLite keeps the project simple. For high traffic or many concurrent users, a database server such as PostgreSQL would be more appropriate.
- Frontend state stays local with `useState` and `useEffect`, as defined in the implementation plan. No additional state management library was added.

## What I Would Improve With More Time

- Add Playwright tests that run the frontend and backend together in a real browser.
- Add a database migration tool so schema changes are versioned and repeatable.
- Add pagination and filtering for the task list and audit history.
- Add database-level audit log protection, such as triggers or permissions that reject update/delete operations.
- Add basic observability, such as structured logging and request tracing.

## How Audit Logs Are Kept From Being Modified

The current implementation protects audit logs in these ways:

- There are no API endpoints for updating or deleting audit logs.
- The service layer only creates audit logs for task creation, meaningful task updates, and soft delete.
- Task changes and audit log creation run in a transaction, so task changes and audit logs cannot partially succeed.
- No-op updates do not create audit logs.
- Integration and e2e tests verify that audit logs are created for create/update/delete actions and remain readable after soft delete.

For a larger production system, this should be strengthened at the database level with append-only protections, restricted database permissions, or triggers that reject audit log updates and deletes.

## Biggest Risk With Many Users

The riskiest area is consistency when multiple users update the same task at the same time.

Main risks:

- Race conditions around status transitions.
- SQLite has limited concurrency compared with a dedicated database server.
- There is no optimistic locking or task version field.
- Audit history can grow large and will eventually need pagination.

The first mitigation would be moving to a stronger database for concurrent writes, adding clear transaction isolation, and adding version-based task updates.

## First Refactor If This Became a Large System

I would refactor the task/audit service and persistence layer first.

Reasons:

- Task updates and audit logs are the most data-sensitive part of the system.
- Status transitions, no-op updates, soft delete, and audit creation need clearer domain boundaries as the system grows.
- The current repository layer is fine for a small project, but a larger system would need migrations, stronger transaction handling, pagination, query optimization, and concurrency control.

The first refactor would include:

- Separating task/audit domain logic from Express and SQLite details.
- Adding optimistic locking or a version field.
- Adding a migration tool.
- Adding stronger database constraints and indexes.
- Making audit logs append-only at the database level.

## AI Usage

AI was used to help with:

- Planning and implementing the backend and frontend based on the PRD and implementation plan.
- Creating unit, integration, and e2e tests.
- Refining the UI into a cleaner minimal design.
- Drafting this documentation.

Validation was done by:

- Brainstorming and shaping `docs/prd.md` and `docs/implementation-plan.md`.
- Reading and following `docs/prd.md` and `docs/implementation-plan.md`.
- Running typecheck, build, unit tests, integration tests, e2e tests, and manual testing for frontend and backend.
- Verifying the required test structure: co-located unit tests, integration tests in `test/integration`, and e2e tests in `test/e2e`.
