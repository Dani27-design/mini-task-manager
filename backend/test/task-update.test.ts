import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { Server } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";

test("isValidStatusTransition enforces the linear task workflow", async () => {
  const { isValidStatusTransition } = await import("../src/modules/task/task.service");

  assert.equal(isValidStatusTransition("to_do", "pending"), true);
  assert.equal(isValidStatusTransition("pending", "in_progress"), true);
  assert.equal(isValidStatusTransition("in_progress", "done"), true);
  assert.equal(isValidStatusTransition("to_do", "to_do"), true);
  assert.equal(isValidStatusTransition("to_do", "in_progress"), false);
  assert.equal(isValidStatusTransition("pending", "done"), false);
  assert.equal(isValidStatusTransition("done", "in_progress"), false);
});

let server: Server;
let baseUrl: string;
let getRow: <T>(sql: string, params?: unknown[]) => Promise<T | undefined>;
let getRows: <T>(sql: string, params?: unknown[]) => Promise<T[]>;

before(async () => {
  const databaseDirectory = mkdtempSync(join(tmpdir(), "mini-task-manager-update-test-"));
  process.env.DATABASE_PATH = join(databaseDirectory, "test.sqlite");

  const { app } = await import("../src/app");
  const { all, get, run } = await import("../src/database/database");
  const { initDatabase } = await import("../src/database/init");

  getRow = get;
  getRows = all;
  await initDatabase();
  await run(
    `
      INSERT INTO tasks (id, title, status, createdAt, updatedAt, deletedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      "task-to-update",
      "Original title",
      "to_do",
      "2026-06-10T00:00:00.000Z",
      "2026-06-10T00:00:00.000Z",
      null
    ]
  );
  await run(
    `
      INSERT INTO tasks (id, title, status, createdAt, updatedAt, deletedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      "deleted-task",
      "Deleted title",
      "to_do",
      "2026-06-10T00:00:00.000Z",
      "2026-06-10T00:00:00.000Z",
      "2026-06-10T00:30:00.000Z"
    ]
  );

  server = await new Promise<Server>((resolve, reject) => {
    const startedServer = app.listen(0, "127.0.0.1", () => {
      resolve(startedServer);
    });

    startedServer.on("error", reject);
  });

  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Expected server to listen on a TCP port");
  }

  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
});

test("PUT /tasks/:id updates a task and records audit changes", async () => {
  const response = await fetch(`${baseUrl}/tasks/task-to-update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "Updated title",
      status: "pending",
      actorId: "john-doe"
    })
  });

  assert.equal(response.status, 200);

  const body = (await response.json()) as any;
  assert.equal(body.title, "Updated title");
  assert.equal(body.status, "pending");

  const taskRow = await getRow<any>("SELECT * FROM tasks WHERE id = ?", ["task-to-update"]);
  assert.equal(taskRow.title, "Updated title");
  assert.equal(taskRow.status, "pending");

  const auditLog = await getRow<any>(
    "SELECT * FROM audit_logs WHERE taskId = ? AND action = ?",
    ["task-to-update", "TASK_UPDATED"]
  );
  assert.ok(auditLog);
  assert.equal(auditLog.actorId, "john-doe");

  const changes = await getRows<any>(
    "SELECT fieldName, previousValue, currentValue FROM audit_log_changes WHERE auditLogId = ? ORDER BY fieldName",
    [auditLog.id]
  );

  assert.deepEqual(changes, [
    {
      fieldName: "status",
      previousValue: "to_do",
      currentValue: "pending"
    },
    {
      fieldName: "title",
      previousValue: "Original title",
      currentValue: "Updated title"
    }
  ]);
});

test("PUT /tasks/:id no-op update does not create an audit log", async () => {
  const beforeCount = await getRow<{ count: number }>(
    "SELECT COUNT(*) as count FROM audit_logs WHERE taskId = ?",
    ["task-to-update"]
  );

  const response = await fetch(`${baseUrl}/tasks/task-to-update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "Updated title",
      status: "pending",
      actorId: "john-doe"
    })
  });

  assert.equal(response.status, 200);

  const afterCount = await getRow<{ count: number }>(
    "SELECT COUNT(*) as count FROM audit_logs WHERE taskId = ?",
    ["task-to-update"]
  );

  assert.equal(afterCount?.count, beforeCount?.count);
});

test("PUT /tasks/:id rejects invalid status transitions", async () => {
  const response = await fetch(`${baseUrl}/tasks/task-to-update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      status: "done",
      actorId: "john-doe"
    })
  });

  assert.equal(response.status, 400);
});

test("PUT /tasks/:id rejects deleted tasks", async () => {
  const response = await fetch(`${baseUrl}/tasks/deleted-task`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "Should not update",
      actorId: "john-doe"
    })
  });

  assert.equal(response.status, 404);
});
