import { Actor } from "../types/actor";
import { AuditLog } from "../types/audit";
import { Task } from "../types/task";

export const actors: Actor[] = [
  { id: "john-doe", name: "John Doe" },
  { id: "jane-smith", name: "Jane Smith" },
  { id: "alex-wilson", name: "Alex Wilson" }
];

export const baseTask: Task = {
  id: "task-1",
  title: "Existing task",
  status: "to_do",
  createdAt: "2026-06-10T00:00:00.000Z",
  updatedAt: "2026-06-10T00:00:00.000Z",
  deletedAt: null
};

export const updatedTask: Task = {
  ...baseTask,
  title: "Updated task",
  status: "pending",
  updatedAt: "2026-06-10T01:00:00.000Z"
};

export const auditLogs: AuditLog[] = [
  {
    id: "audit-1",
    taskId: "task-1",
    actorId: "jane-smith",
    actorName: "Jane Smith",
    action: "TASK_UPDATED",
    createdAt: "2026-06-10T01:00:00.000Z",
    changes: [
      {
        id: "change-1",
        auditLogId: "audit-1",
        fieldName: "title",
        previousValue: "Existing task",
        currentValue: "Updated task"
      }
    ]
  }
];
