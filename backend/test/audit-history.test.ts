import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { Server } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";

let server: Server;
let baseUrl: string;

before(async () => {
  const databaseDirectory = mkdtempSync(join(tmpdir(), "mini-task-manager-audit-test-"));
  process.env.DATABASE_PATH = join(databaseDirectory, "test.sqlite");

  const { app } = await import("../src/app");
  const { initDatabase } = await import("../src/database/init");

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

test("GET /tasks/:id/audit-logs returns grouped newest-first audit history", async () => {
  const createResponse = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "Audited task",
      actorId: "john-doe"
    })
  });
  const createdTask = (await createResponse.json()) as any;

  await fetch(`${baseUrl}/tasks/${createdTask.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "Audited task updated",
      status: "pending",
      actorId: "jane-smith"
    })
  });

  await fetch(`${baseUrl}/tasks/${createdTask.id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      actorId: "alex-wilson"
    })
  });

  const auditResponse = await fetch(`${baseUrl}/tasks/${createdTask.id}/audit-logs`);

  assert.equal(auditResponse.status, 200);

  const auditLogs = (await auditResponse.json()) as any[];

  assert.deepEqual(
    auditLogs.map((auditLog) => auditLog.action),
    ["TASK_DELETED", "TASK_UPDATED", "TASK_CREATED"]
  );
  assert.deepEqual(
    auditLogs.map((auditLog) => auditLog.actorName),
    ["Alex Wilson", "Jane Smith", "John Doe"]
  );
  assert.equal(auditLogs[0].changes.length, 0);
  assert.equal(auditLogs[2].changes.length, 0);

  const updateChanges = auditLogs[1].changes;
  assert.deepEqual(
    updateChanges.map((change: any) => change.fieldName),
    ["status", "title"]
  );
  assert.deepEqual(
    updateChanges.map((change: any) => [change.previousValue, change.currentValue]),
    [
      ["to_do", "pending"],
      ["Audited task", "Audited task updated"]
    ]
  );
});
