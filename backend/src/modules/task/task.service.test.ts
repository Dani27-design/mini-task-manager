import assert from "node:assert/strict";
import { test } from "node:test";

test("createTaskService creates a to_do task and TASK_CREATED audit log", async () => {
  const { createTaskService } = await import("./task.service");

  const ids = ["task-id", "audit-id"];
  let capturedTask: any;
  let capturedAuditLog: any;

  const task = await createTaskService(
    {
      title: "Write documentation",
      actorId: "john-doe"
    },
    {
      createTaskRecord: async (taskRecord) => {
        capturedTask = taskRecord;
      },
      createAuditLogRecord: async (auditLogRecord) => {
        capturedAuditLog = auditLogRecord;
      },
      runTransaction: async (operation) => operation(),
      createId: () => ids.shift() ?? "unexpected-id",
      getNow: () => new Date("2026-06-10T00:00:00.000Z")
    }
  );

  assert.equal(task.id, "task-id");
  assert.equal(task.status, "to_do");
  assert.equal(capturedTask.status, "to_do");
  assert.equal(capturedAuditLog.taskId, "task-id");
  assert.equal(capturedAuditLog.actorId, "john-doe");
  assert.equal(capturedAuditLog.action, "TASK_CREATED");
});

test("isValidStatusTransition enforces the linear task workflow", async () => {
  const { isValidStatusTransition } = await import("./task.service");

  assert.equal(isValidStatusTransition("to_do", "pending"), true);
  assert.equal(isValidStatusTransition("pending", "in_progress"), true);
  assert.equal(isValidStatusTransition("in_progress", "done"), true);
  assert.equal(isValidStatusTransition("to_do", "to_do"), true);
  assert.equal(isValidStatusTransition("to_do", "in_progress"), false);
  assert.equal(isValidStatusTransition("pending", "done"), false);
  assert.equal(isValidStatusTransition("done", "in_progress"), false);
});
