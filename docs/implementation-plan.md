# IMPLEMENTATION PLAN

---

## 0. OVERVIEW

This document defines the step-by-step implementation plan for the Mini Task Manager system.

The system must be implemented incrementally, with each phase delivering a fully working and verifiable system state.

Each phase must be completed before moving to the next.

No functionality outside this document and PRD must be implemented.

---

## 1. TECH STACK

### Backend
- Node.js
- Express
- TypeScript
- SQLite (sqlite3)
- Zod
- UUID v4

### Frontend
- React
- TypeScript
- Axios

### State Management
- useState
- useEffect

---

## 2. ARCHITECTURE

### Backend Flow

```text
Route
→ Middleware (validation)
→ Controller
→ Service
→ Repository
→ SQLite
```

### Error Handling Flow

```text
Any Layer
→ Error Middleware
→ Standard API Response
```

---

## 3. MIDDLEWARE

### Request Validation Middleware
Responsible for validating incoming requests using Zod schemas.

Rules:
- Must validate before controller execution
- Invalid requests must be rejected immediately
- Controllers only receive validated data

---

### Error Handling Middleware
Responsible for centralized error handling.

Rules:
- All errors must be normalized
- Must return consistent response format
- Must handle validation, not found, and business rule errors

---

## 4. VALIDATION RULES

- All request validation must use Zod
- Validation must happen before controller execution
- Controllers must not perform raw validation

---

## 5. CORE DATA RULES

### Task Rules
- Task follows strict status lifecycle
- Valid transitions only:
  to_do → pending → in_progress → done
- Soft delete is used via deletedAt

### Audit Rules
- Audit logs are immutable
- Every meaningful change creates an audit log
- No-op updates must NOT create audit logs
- Audit logs represent real state changes only

### Transaction Rules
- Task update and audit creation must be atomic
- Partial success is not allowed

---

## 6. DATABASE SCHEMA

### tasks
```text
id
title
status
createdAt
updatedAt
deletedAt
```

---

### audit_logs
```text
id
taskId
actorId
action
createdAt
```

---

### audit_log_changes
```text
id
auditLogId
fieldName
previousValue
currentValue
```

---

## 7. API CONTRACT

### Task APIs
```http
POST   /tasks
GET    /tasks
PUT    /tasks/:id
DELETE /tasks/:id
```

### Audit APIs
```http
GET /tasks/:id/audit-logs
```

### Actor APIs
```http
GET /actors
```

---

## 8. PROJECT STRUCTURE

### Backend
```text
backend/src/

app.ts

database/
  database.ts
  init.ts

middleware/
  validate.middleware.ts
  error.middleware.ts

utils/
  uuid.ts

constants/
  actors.ts
  task-status.ts
  audit-actions.ts

modules/task/
  task.routes.ts
  task.controller.ts
  task.service.ts
  task.repository.ts
  audit.repository.ts
  task.schemas.ts
```

---

### Frontend
```text
frontend/src/

pages/
  TaskPage.tsx

components/
  TaskForm.tsx
  TaskList.tsx
  TaskRow.tsx
  ActorSelect.tsx
  AuditHistory.tsx
  AuditEvent.tsx
  AuditChanges.tsx

services/
  task.api.ts
  actor.api.ts

types/
  task.ts
  actor.ts
  audit.ts
```

---

# 9. IMPLEMENTATION PHASES

Each phase must be completed fully before moving to the next.

Each phase must include:
- backend implementation
- frontend implementation (if applicable)
- required tests
- verification checklist

---

## PHASE 1 — PROJECT FOUNDATION — DONE

### Backend Tasks
- Initialize Express application
- Setup TypeScript configuration
- Setup SQLite connection and initialization
- Register global error middleware
- Register validation middleware
- Create UUID utility
- Create constants:
  - actors
  - task-status
  - audit-actions
- Create module skeleton for task:
  - routes
  - controller
  - service
  - repository
  - audit repository
  - schemas

### Frontend Tasks
- Initialize React application
- Create base page (TaskPage)
- Create component structure without logic:
  - TaskForm
  - TaskList
  - TaskRow
  - ActorSelect

### Verification
- Backend starts successfully
- Frontend starts successfully
- Database initializes correctly

---

## PHASE 2 — ACTORS — DONE

### Backend Tasks
- Define static actor list in backend constants
- Implement GET /actors endpoint

### Frontend Tasks
- Implement ActorSelect component
- Fetch actors from backend API
- Display actors in dropdown

### Rules
- Actors must not be hardcoded in frontend

### Verification
- Actor list is loaded from backend
- Actor selection works correctly

---

## PHASE 3 — CREATE TASK — DONE

### Backend Tasks
- Implement POST /tasks endpoint
- Validate input using Zod:
  - title required
  - actorId required
- Create task with:
  - generated UUID
  - default status = to_do
- Create audit log with action TASK_CREATED

### Frontend Tasks
- Implement TaskForm submission
- Call POST /tasks API
- Refresh task list after creation

### Tests
- Unit test for task creation logic
- Integration test for API create task

### Verification
- Task is created successfully
- Task status defaults to to_do
- Audit log is created

---

## PHASE 4 — LIST TASKS — DONE

### Backend Tasks
- Implement GET /tasks endpoint
- Exclude tasks where deletedAt is set
- Sort tasks by updatedAt descending

### Frontend Tasks
- Implement TaskList component
- Render TaskRow components
- Display title and status

### Tests
- Integration test for task listing

### Verification
- Active tasks are displayed
- Deleted tasks are not included

---

## PHASE 5 — UPDATE TASK — DONE

### Backend Tasks
- Implement PUT /tasks/:id endpoint
- Fetch existing task
- Validate status transition rules
- Detect field changes
- Update task data
- Create audit log entry
- Create audit log changes per field

### Rules
- No-op update must not create audit log
- Invalid status transition must be rejected
- Deleted tasks cannot be updated

### Transaction
- Task update and audit creation must succeed together

### Frontend Tasks
- Enable editing of task title and status
- Submit updates via API

### Tests
- Unit test for transition validation
- Integration test for update flow

### Verification
- Task updates correctly
- Audit logs reflect actual changes
- No-op updates are ignored

---

## PHASE 6 — DELETE TASK — DONE

### Backend Tasks
- Implement DELETE /tasks/:id endpoint
- Set deletedAt timestamp
- Create audit log with action TASK_DELETED

### Frontend Tasks
- Add delete action in TaskRow

### Tests
- Integration test for delete behavior

### Verification
- Task is hidden from list
- Audit log remains accessible

---

## PHASE 7 — AUDIT LOGS

### Backend Tasks
- Implement GET /tasks/:id/audit-logs
- Return audit logs with:
  - actorId
  - actorName
  - action
  - createdAt
  - changes array
- Sort logs by newest first

### Frontend Tasks
- Implement AuditHistory component
- Implement AuditEvent component
- Implement AuditChanges component
- Render expandable audit view per task

### Tests
- E2E test for audit history flow

### Verification
- Audit logs are visible per task
- Changes are grouped correctly
- Ordering is correct

---

## PHASE 8 — ERROR HANDLING

### Backend Tasks
- Implement global error middleware
- Normalize all error responses into:

```json
{
  "error": {
    "code": "...",
    "message": "..."
  }
}
```

- Handle:
  - validation errors
  - not found errors
  - invalid transitions
  - server errors

### Tests
- Integration tests for error cases

### Verification
- All errors follow consistent format

---

## PHASE 9 — END-TO-END VALIDATION

### Frontend Tests
- Task creation flow
- Task update flow
- Task deletion flow
- Audit log viewing flow

### System Verification
- Full task lifecycle works end-to-end
- Audit logs correctly reflect all changes
- Status rules are enforced
- Soft delete works correctly
- API responses are consistent

---
