import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { Server } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";

let server: Server;
let baseUrl: string;
let getRow: <T>(sql: string, params?: unknown[]) => Promise<T | undefined>;

before(async () => {
  const databaseDirectory = mkdtempSync(join(tmpdir(), "mini-task-manager-delete-test-"));
  process.env.DATABASE_PATH = join(databaseDirectory, "test.sqlite");

  const { app } = await import("../../src/app");
  const { get, run } = await import("../../src/database/database");
  const { initDatabase } = await import("../../src/database/init");

  getRow = get;
  await initDatabase();
  await run(
    `
      INSERT INTO tasks (id, title, status, createdAt, updatedAt, deletedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      "task-to-delete",
      "Task to delete",
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
      "already-deleted-task",
      "Already deleted task",
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

test("DELETE /tasks/:id soft-deletes a task and creates a TASK_DELETED audit log", async () => {
  const response = await fetch(`${baseUrl}/tasks/task-to-delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      actorId: "john-doe"
    })
  });

  assert.equal(response.status, 200);

  const body = (await response.json()) as any;
  assert.equal(body.id, "task-to-delete");
  assert.equal(typeof body.deletedAt, "string");

  const taskRow = await getRow<any>("SELECT * FROM tasks WHERE id = ?", ["task-to-delete"]);
  assert.equal(typeof taskRow.deletedAt, "string");

  const listResponse = await fetch(`${baseUrl}/tasks`);
  const tasks = (await listResponse.json()) as Array<{ id: string }>;
  assert.equal(tasks.some((task) => task.id === "task-to-delete"), false);

  const auditLog = await getRow<any>(
    "SELECT * FROM audit_logs WHERE taskId = ? AND action = ?",
    ["task-to-delete", "TASK_DELETED"]
  );
  assert.ok(auditLog);
  assert.equal(auditLog.actorId, "john-doe");
});

test("DELETE /tasks/:id rejects already deleted tasks", async () => {
  const response = await fetch(`${baseUrl}/tasks/already-deleted-task`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      actorId: "john-doe"
    })
  });

  assert.equal(response.status, 404);
});

test("DELETE /tasks/:id rejects unknown tasks", async () => {
  const response = await fetch(`${baseUrl}/tasks/missing-task`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      actorId: "john-doe"
    })
  });

  assert.equal(response.status, 404);
});
