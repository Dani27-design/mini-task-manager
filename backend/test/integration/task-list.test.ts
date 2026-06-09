import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { Server } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";

let server: Server;
let baseUrl: string;

before(async () => {
  const databaseDirectory = mkdtempSync(join(tmpdir(), "mini-task-manager-list-test-"));
  process.env.DATABASE_PATH = join(databaseDirectory, "test.sqlite");

  const { app } = await import("../../src/app");
  const { run } = await import("../../src/database/database");
  const { initDatabase } = await import("../../src/database/init");

  await initDatabase();
  await run(
    `
      INSERT INTO tasks (id, title, status, createdAt, updatedAt, deletedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      "older-active-task",
      "Older active task",
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
      "newer-active-task",
      "Newer active task",
      "to_do",
      "2026-06-10T00:00:00.000Z",
      "2026-06-10T01:00:00.000Z",
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
      "Deleted task",
      "to_do",
      "2026-06-10T00:00:00.000Z",
      "2026-06-10T02:00:00.000Z",
      "2026-06-10T02:30:00.000Z"
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

test("GET /tasks returns active tasks sorted by updatedAt descending", async () => {
  const response = await fetch(`${baseUrl}/tasks`);

  assert.equal(response.status, 200);

  const tasks = (await response.json()) as Array<{ id: string; title: string }>;

  assert.deepEqual(
    tasks.map((task) => task.id),
    ["newer-active-task", "older-active-task"]
  );
  assert.equal(tasks.some((task) => task.id === "deleted-task"), false);
});
