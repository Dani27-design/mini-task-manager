# PRD - Mini Task Manager (Internal Tool)

---

## 1. Overview

Mini Task Manager is a simple internal application used by a team to manage tasks and track all changes made to those tasks over time.

The primary goal of this system is not only to manage task data, but also to provide a reliable and immutable history of all changes so that every modification can be traced clearly.

The system must ensure that:
- Task data is consistent
- All changes are recorded permanently
- The history of changes is easy to read and understand

---

## 2. Problem Statement

In the current workflow:
- Task status changes frequently
- It is unclear who changed a task and when
- Historical changes are difficult to trace
- UI does not clearly represent change history

This leads to lack of transparency and difficulty in tracking accountability.

---

## 3. Goals

The system should:
- Allow users to create tasks
- Allow users to update task information and status
- Allow users to delete tasks (soft delete)
- Track every change made to tasks
- Provide a clear audit history per task
- Show who made each change and when it happened

---

## 4. Scope

### In Scope

- Task creation
- Task update (title and status)
- Task deletion (soft delete)
- Task listing
- Audit log tracking for all changes
- Viewing audit history per task
- Predefined actor selection

### Out of Scope

- Authentication
- Authorization / roles / permissions
- User registration
- Real-time updates
- Notifications
- Search and filtering
- Pagination
- External integrations

---

## 5. Task Model

Each task has the following structure:

### Task Fields

- id (unique identifier)
- title (string)
- status (string)
- createdAt (timestamp)
- updatedAt (timestamp)
- deletedAt (timestamp or null)

---

## 6. Task Status Rules

A task follows a strict linear workflow:

```text
to_do → pending → in_progress → done
```

### Rules:
- A task must start in `to_do`
- Only valid transitions are allowed
- Invalid transitions must be rejected by the system
- A task cannot skip states

---

## 7. Actors

All actions must be associated with an actor.

Actors are predefined and selected from a fixed list.

Each actor has:
- id
- name

Example:
- john-doe / John Doe
- jane-smith / Jane Smith
- alex-wilson / Alex Wilson

Actors are not created, edited, or deleted by users.

---

## 8. Audit Log System

Every change in the system must generate an audit log entry.

Audit logs are immutable and must never be edited or deleted.

---

### 8.1 Audit Log Structure

Each audit log entry contains:

- id
- taskId
- actorId
- action
- createdAt

---

### 8.2 Audit Log Changes

If a task field is updated, each changed field must be recorded separately.

Each change contains:
- fieldName
- previousValue
- currentValue

---

### 8.3 Actions

The system supports the following actions:

- TASK_CREATED
- TASK_UPDATED
- TASK_DELETED

---

### 8.4 Rules

- Every create, update, and delete action must generate an audit log
- If no field actually changes during update, no audit log is created
- Audit logs must remain permanently stored
- Audit logs must be displayed in chronological order (newest first)

---

## 9. Soft Delete Behavior

When a task is deleted:
- The task is not physically removed
- deletedAt is set
- The task is excluded from normal task listing
- The task’s audit history remains accessible
- A TASK_DELETED audit log must be created

---

## 10. API Requirements

### 10.1 Tasks

- POST /tasks → create task
- GET /tasks → list tasks
- PUT /tasks/:id → update task
- DELETE /tasks/:id → delete task (soft delete)

---

### 10.2 Audit Logs

- GET /tasks/:id/audit-logs → get audit history for a task

---

### 10.3 Actors

- GET /actors → list predefined actors

---

## 11. Validation Rules

### Task Creation

- title is required
- actorId is required
- status is always initialized to `to_do`

### Task Update

- title is optional
- status is optional
- actorId is required
- invalid status transitions are rejected
- updating with same value must not create audit logs

---

## 12. Error Handling

All errors must follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### Common Error Cases:

- Validation error
- Task not found
- Invalid status transition
- Internal server error

---

## 13. Data Consistency Requirements

- Task updates and audit log creation must be atomic
- If any part of an operation fails, the entire operation must fail
- Audit logs must always reflect actual task state changes

---

## 14. UI Requirements

The UI must be simple and functional.

### Task List

Must display:
- title
- status
- last updated time

Each task must allow:
- update
- delete
- expand audit history

---

### Audit History UI

Audit history must clearly show:
- actor
- action type
- timestamp
- field changes (before → after)

---

## 15. Non-Functional Requirements

- System must be simple and easy to run locally
- No external dependencies requiring paid services
- No authentication required
- Must run with minimal setup effort
- Code must be readable and consistent

---

## 16. Persistence

Data storage must ensure:
- Tasks are persisted
- Audit logs are persisted
- Audit logs cannot be modified after creation

Storage implementation is flexible (SQLite or equivalent local database is acceptable).

---

## 17. Summary

This system focuses on:
- simple task management
- strict state transition control
- complete audit trail for all changes
- clarity and traceability over complexity