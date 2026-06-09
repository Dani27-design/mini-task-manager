import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { Server } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { errorMiddleware } from "../src/middleware/error.middleware";

let server: Server;
let baseUrl: string;

before(async () => {
  const databaseDirectory = mkdtempSync(join(tmpdir(), "mini-task-manager-error-test-"));
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

async function readError(response: Response): Promise<{
  error: {
    code: string;
    message: string;
  };
}> {
  const body = (await response.json()) as {
    error?: {
      code?: unknown;
      message?: unknown;
    };
  };

  assert.equal(typeof body.error?.code, "string");
  assert.equal(typeof body.error?.message, "string");

  return body as {
    error: {
      code: string;
      message: string;
    };
  };
}

test("validation errors use the standard error response format", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      actorId: "john-doe"
    })
  });

  assert.equal(response.status, 400);

  const body = await readError(response);
  assert.equal(body.error.code, "VALIDATION_ERROR");
});

test("task not found errors use the standard error response format", async () => {
  const response = await fetch(`${baseUrl}/tasks/missing-task`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "Missing task",
      actorId: "john-doe"
    })
  });

  assert.equal(response.status, 404);

  const body = await readError(response);
  assert.equal(body.error.code, "TASK_NOT_FOUND");
});

test("invalid transition errors use the standard error response format", async () => {
  const createResponse = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "Transition error task",
      actorId: "john-doe"
    })
  });
  const task = (await createResponse.json()) as { id: string };

  const response = await fetch(`${baseUrl}/tasks/${task.id}`, {
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

  const body = await readError(response);
  assert.equal(body.error.code, "INVALID_STATUS_TRANSITION");
});

test("unknown routes use the standard error response format", async () => {
  const response = await fetch(`${baseUrl}/missing-route`);

  assert.equal(response.status, 404);

  const body = await readError(response);
  assert.equal(body.error.code, "NOT_FOUND");
});

test("internal errors use the standard error response format", () => {
  let statusCode = 0;
  let body: unknown;
  const response = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: unknown) {
      body = payload;
      return this;
    }
  };

  errorMiddleware(
    new Error("Unexpected failure"),
    {} as any,
    response as any,
    (() => undefined) as any
  );

  assert.equal(statusCode, 500);
  assert.deepEqual(body, {
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error"
    }
  });
});
