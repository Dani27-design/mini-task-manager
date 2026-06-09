import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { Server } from "node:http";

let server: Server;
let baseUrl: string;
let getRow: <T>(sql: string, params?: unknown[]) => Promise<T | undefined>;

before(async () => {
  const databaseDirectory = mkdtempSync(join(tmpdir(), "mini-task-manager-test-"));
  process.env.DATABASE_PATH = join(databaseDirectory, "test.sqlite");

  const { app } = await import("../../src/app");
  const { initDatabase } = await import("../../src/database/init");
  const { get } = await import("../../src/database/database");

  getRow = get;
  await initDatabase();

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

test("POST /tasks creates a task with a TASK_CREATED audit log", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "Create the first task",
      actorId: "john-doe"
    })
  });

  assert.equal(response.status, 201);

  const body = (await response.json()) as any;
  assert.equal(body.title, "Create the first task");
  assert.equal(body.status, "to_do");
  assert.equal(body.deletedAt, null);

  const taskRow = await getRow<any>("SELECT * FROM tasks WHERE id = ?", [body.id]);
  assert.ok(taskRow);
  assert.equal(taskRow.status, "to_do");

  const auditLogRow = await getRow<any>("SELECT * FROM audit_logs WHERE taskId = ?", [body.id]);
  assert.ok(auditLogRow);
  assert.equal(auditLogRow.actorId, "john-doe");
  assert.equal(auditLogRow.action, "TASK_CREATED");
});
